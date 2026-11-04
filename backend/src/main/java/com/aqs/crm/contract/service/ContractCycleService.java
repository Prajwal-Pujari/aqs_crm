package com.aqs.crm.contract.service;

import com.aqs.crm.audit.service.AuditService;
import com.aqs.crm.common.exception.BadRequestException;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.contract.dto.ContractCycleCreateRequest;
import com.aqs.crm.contract.dto.ContractCycleDto;
import com.aqs.crm.contract.dto.RenewRequest;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.reminder.service.RenewalReminderService;
import com.aqs.crm.subscription.entity.Subscription;
import com.aqs.crm.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContractCycleService {

    private final ContractCycleRepository contractCycleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AuditService auditService;
    private final RenewalReminderService renewalReminderService;

    @Transactional(readOnly = true)
    public List<ContractCycleDto> getCyclesBySubscription(Long subscriptionId) {
        if (!subscriptionRepository.existsById(subscriptionId)) {
            throw new ResourceNotFoundException("Subscription", "id", subscriptionId);
        }
        return contractCycleRepository.findBySubscriptionIdOrderByCycleNoDesc(subscriptionId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContractCycleDto getCycleById(Long subscriptionId, Long id) {
        ContractCycle cycle = contractCycleRepository.findByIdAndSubscriptionId(id, subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractCycle", "id", id));
        return toDto(cycle);
    }

    @Transactional
    public ContractCycleDto createFirstCycle(Long subscriptionId, ContractCycleCreateRequest req, Long userId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", subscriptionId));

        if (req.endDate().isBefore(req.startDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        int nextCycleNo = contractCycleRepository.findTopBySubscriptionIdOrderByCycleNoDesc(subscriptionId)
                .map(c -> c.getCycleNo() + 1)
                .orElse(1);

        ContractCycle cycle = ContractCycle.builder()
                .subscription(subscription)
                .cycleNo(nextCycleNo)
                .startDate(req.startDate())
                .endDate(req.endDate())
                .amount(req.amount())
                .poNumber(req.poNumber())
                .poDate(req.poDate())
                .status(CycleStatus.ACTIVE)
                .notes(req.notes())
                .build();

        ContractCycle saved = contractCycleRepository.save(cycle);
        log.info("Created contract cycle #{} id={} for subscription={}", nextCycleNo, saved.getId(), subscriptionId);

        auditService.logCreate("CONTRACT_CYCLE", saved.getId(), userId);
        return toDto(saved);
    }

    @Transactional
    public ContractCycleDto updateCycle(Long subscriptionId, Long id, ContractCycleCreateRequest req, Long userId) {
        ContractCycle cycle = contractCycleRepository.findByIdAndSubscriptionId(id, subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractCycle", "id", id));

        if (req.endDate().isBefore(req.startDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        // Audit changes to amount
        if (!Objects.equals(cycle.getAmount(), req.amount())) {
            auditService.logChange("CONTRACT_CYCLE", cycle.getId(), "UPDATE", "amount",
                    String.valueOf(cycle.getAmount()), String.valueOf(req.amount()), userId);
            cycle.setAmount(req.amount());
        }

        // Audit changes to PO number
        if (!Objects.equals(cycle.getPoNumber(), req.poNumber())) {
            auditService.logChange("CONTRACT_CYCLE", cycle.getId(), "UPDATE", "poNumber",
                    cycle.getPoNumber(), req.poNumber(), userId);
            cycle.setPoNumber(req.poNumber());
        }

        // Audit changes to PO date
        if (!Objects.equals(cycle.getPoDate(), req.poDate())) {
            auditService.logChange("CONTRACT_CYCLE", cycle.getId(), "UPDATE", "poDate",
                    String.valueOf(cycle.getPoDate()), String.valueOf(req.poDate()), userId);
            cycle.setPoDate(req.poDate());
        }

        cycle.setStartDate(req.startDate());
        cycle.setEndDate(req.endDate());
        cycle.setNotes(req.notes());

        ContractCycle saved = contractCycleRepository.save(cycle);
        log.info("Updated contract cycle id={}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public ContractCycleDto renewCycle(Long subscriptionId, Long id, RenewRequest req, Long userId) {
        ContractCycle currentCycle = contractCycleRepository.findByIdAndSubscriptionId(id, subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractCycle", "id", id));

        if (currentCycle.getStatus() == CycleStatus.RENEWED) {
            throw new BadRequestException("This cycle has already been renewed");
        }

        // Mark current cycle as RENEWED
        CycleStatus oldStatus = currentCycle.getStatus();
        currentCycle.setStatus(CycleStatus.RENEWED);
        contractCycleRepository.save(currentCycle);

        // Cancel any pending renewal reminders & queued emails for the old cycle
        renewalReminderService.cancelPendingReminders(currentCycle.getId());

        auditService.logChange("CONTRACT_CYCLE", currentCycle.getId(), "UPDATE", "status",
                oldStatus.name(), CycleStatus.RENEWED.name(), userId);

        // Compute start date: req.startDate or currentCycle.endDate + 1 day
        LocalDate newStart = req.startDate() != null ? req.startDate() : currentCycle.getEndDate().plusDays(1);
        LocalDate newEnd = req.endDate() != null ? req.endDate() : newStart.plusYears(1).minusDays(1);

        if (newEnd.isBefore(newStart)) {
            throw new BadRequestException("New end date cannot be before new start date");
        }

        BigDecimal newAmount = req.amount() != null ? req.amount() : currentCycle.getAmount();

        int nextCycleNo = currentCycle.getCycleNo() + 1;

        ContractCycle newCycle = ContractCycle.builder()
                .subscription(currentCycle.getSubscription())
                .cycleNo(nextCycleNo)
                .startDate(newStart)
                .endDate(newEnd)
                .amount(newAmount)
                .poNumber(req.poNumber())
                .poDate(req.poDate())
                .status(CycleStatus.ACTIVE)
                .renewedFrom(currentCycle)
                .notes(req.notes())
                .build();

        ContractCycle savedNewCycle = contractCycleRepository.save(newCycle);
        log.info("Renewed cycle id={} -> created new cycle id={} (cycle #{})",
                currentCycle.getId(), savedNewCycle.getId(), nextCycleNo);

        auditService.logCreate("CONTRACT_CYCLE", savedNewCycle.getId(), userId);
        auditService.logChange("CONTRACT_CYCLE", savedNewCycle.getId(), "RENEWAL", "renewedFrom",
                String.valueOf(currentCycle.getId()), String.valueOf(savedNewCycle.getId()), userId);

        return toDto(savedNewCycle);
    }

    public ContractCycleDto toDto(ContractCycle cycle) {
        return new ContractCycleDto(
                cycle.getId(),
                cycle.getSubscription().getId(),
                cycle.getCycleNo(),
                cycle.getStartDate(),
                cycle.getEndDate(),
                cycle.getAmount(),
                cycle.getPoNumber(),
                cycle.getPoDate(),
                cycle.getStatus().name(),
                cycle.getRenewedFrom() != null ? cycle.getRenewedFrom().getId() : null,
                cycle.getNotes(),
                cycle.getCreatedAt(),
                cycle.getUpdatedAt()
        );
    }
}

