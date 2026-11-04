package com.aqs.crm.reminder.service;

import com.aqs.crm.company.entity.Company;
import com.aqs.crm.contact.entity.Contact;
import com.aqs.crm.contact.repository.ContactRepository;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.entity.CycleStatus;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.entity.EmailTemplate;
import com.aqs.crm.email.service.EmailQueueService;
import com.aqs.crm.email.service.TemplateRenderer;
import com.aqs.crm.reminder.entity.ReminderConfig;
import com.aqs.crm.reminder.entity.ReminderLog;
import com.aqs.crm.reminder.repository.ReminderConfigRepository;
import com.aqs.crm.reminder.repository.ReminderLogRepository;
import com.aqs.crm.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class RenewalReminderService {

    private final ContractCycleRepository cycleRepository;
    private final ReminderConfigRepository configRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final ContactRepository contactRepository;
    private final EmailQueueService emailQueueService;
    private final TemplateRenderer templateRenderer;
    private final TaskService taskService;

    @Transactional
    public int processRemindersForDate(LocalDate referenceDate) {
        log.info("Running renewal reminders evaluation for date: {}", referenceDate);

        List<ReminderConfig> activeConfigs = configRepository.findActiveConfigsWithTemplate();
        if (activeConfigs.isEmpty()) {
            log.info("No active reminder configs found.");
            return 0;
        }

        // Sort by offset ascending (-60, -30, -15, -7, 3, 10)
        activeConfigs.sort(Comparator.comparingInt(ReminderConfig::getDaysOffset));

        List<CycleStatus> eligibleStatuses = List.of(CycleStatus.ACTIVE, CycleStatus.RENEWAL_DUE, CycleStatus.OVERDUE);
        List<ContractCycle> activeCycles = cycleRepository.findByStatusIn(eligibleStatuses);

        log.info("Found {} active/due cycles to evaluate against {} reminder configs",
                activeCycles.size(), activeConfigs.size());

        int totalRemindersTriggered = 0;

        for (ContractCycle cycle : activeCycles) {
            LocalDate endDate = cycle.getEndDate();
            if (endDate == null) continue;

            long daysUntilExpiry = ChronoUnit.DAYS.between(referenceDate, endDate);

            // Update cycle status if appropriate
            updateCycleStatusIfNecessary(cycle, referenceDate);

            // Evaluate each reminder tier
            for (int i = 0; i < activeConfigs.size(); i++) {
                ReminderConfig currentConfig = activeConfigs.get(i);
                int triggerOffset = currentConfig.getDaysOffset(); // e.g. -60

                // Determine catch-up window upper bound
                Integer nextWindowOffset = (i < activeConfigs.size() - 1)
                        ? activeConfigs.get(i + 1).getDaysOffset()
                        : null;

                boolean shouldTrigger = isReminderEligible(daysUntilExpiry, triggerOffset, nextWindowOffset);

                if (shouldTrigger) {
                    boolean alreadySentForCycle = reminderLogRepository
                            .existsByCycleIdAndReminderType(cycle.getId(), currentConfig.getTriggerCode());

                    if (!alreadySentForCycle) {
                        int sentForThisTier = triggerReminderForCycle(cycle, currentConfig, referenceDate);
                        totalRemindersTriggered += sentForThisTier;
                    }
                }
            }
        }

        log.info("Renewal reminders processing completed. Total triggered: {}", totalRemindersTriggered);
        return totalRemindersTriggered;
    }

    /**
     * Determines if a reminder should trigger on or after its trigger offset, taking catch-up into account.
     */
    public boolean isReminderEligible(long daysUntilExpiry, int triggerOffset, Integer nextOffset) {
        // daysUntilExpiry = endDate - today
        // For triggerOffset = -60: trigger on -60 days (i.e. exactly 60 days before end date -> daysUntilExpiry = 60).
        // If triggerOffset is -60: target daysUntilExpiry is 60.
        // For triggerOffset = +3: target is 3 days overdue (daysUntilExpiry = -3).
        long targetDaysRemaining = -triggerOffset;

        if (triggerOffset < 0) {
            // Before expiry (e.g. -60, -30, -15, -7)
            // Target days remaining: 60, 30, 15, 7.
            // Catch-up: we trigger if current daysUntilExpiry <= targetDaysRemaining
            // AND (if nextOffset exists) daysUntilExpiry > -nextOffset
            long lowerBound = nextOffset != null ? -nextOffset : 0;
            return daysUntilExpiry <= targetDaysRemaining && daysUntilExpiry > lowerBound;
        } else {
            // After expiry (overdue, e.g. +3, +10)
            // Target days remaining: -3, -10.
            // Catch-up: we trigger if current daysUntilExpiry <= targetDaysRemaining
            // AND (if nextOffset exists) daysUntilExpiry > -nextOffset
            long lowerBound = nextOffset != null ? -nextOffset : -365;
            return daysUntilExpiry <= targetDaysRemaining && daysUntilExpiry > lowerBound;
        }
    }

    private int triggerReminderForCycle(ContractCycle cycle, ReminderConfig config, LocalDate today) {
        Company company = cycle.getSubscription().getCompany();
        String productName = cycle.getSubscription().getProduct().getName();

        List<Contact> recipients = contactRepository.findByCompanyIdAndIsBillingTrue(company.getId());
        if (recipients.isEmpty()) {
            recipients = contactRepository.findByCompanyId(company.getId());
        }

        if (recipients.isEmpty()) {
            log.warn("No contacts found for company ID: {} (Cycle ID: {}). Cannot send reminder.",
                    company.getId(), cycle.getId());
            return 0;
        }

        EmailTemplate template = config.getTemplate();
        int sentCount = 0;

        for (Contact contact : recipients) {
            // Double check idempotency per contact
            if (reminderLogRepository.existsByCycleIdAndReminderTypeAndContactId(
                    cycle.getId(), config.getTriggerCode(), contact.getId())) {
                continue;
            }

            Map<String, Object> vars = new HashMap<>();
            vars.put("company_name", company.getName());
            vars.put("contact_name", (contact.getFirstName() + " " + (contact.getLastName() != null ? contact.getLastName() : "")).trim());
            vars.put("product_name", productName);
            vars.put("end_date", cycle.getEndDate());
            vars.put("due_date", cycle.getEndDate());
            vars.put("amount", cycle.getAmount() != null ? "₹" + cycle.getAmount() : "N/A");
            vars.put("po_number", cycle.getPoNumber() != null ? cycle.getPoNumber() : "N/A");
            vars.put("days_remaining", Math.max(0, ChronoUnit.DAYS.between(today, cycle.getEndDate())));

            String subject = templateRenderer.render(template.getSubject(), vars);
            String bodyHtml = templateRenderer.render(template.getBodyHtml(), vars);

            // Queue email
            EmailQueue queueItem = emailQueueService.queueEmail(
                    contact.getEmail(),
                    contact.getFirstName() + " " + (contact.getLastName() != null ? contact.getLastName() : ""),
                    subject,
                    bodyHtml,
                    EmailCategory.TRANSACTIONAL,
                    null,
                    company,
                    contact,
                    cycle
            );

            // Record reminder log (idempotent record)
            ReminderLog reminderLog = ReminderLog.builder()
                    .cycle(cycle)
                    .reminderType(config.getTriggerCode())
                    .contact(contact)
                    .emailQueue(queueItem)
                    .isCancelled(false)
                    .build();

            reminderLogRepository.save(reminderLog);
            sentCount++;
        }

        // Auto-create internal follow-up task for sales/account owner
        createFollowUpTask(cycle, company, productName, config.getTriggerCode(), today);

        return sentCount;
    }

    private void createFollowUpTask(ContractCycle cycle, Company company, String productName,
                                    String triggerCode, LocalDate today) {
        String title;
        String priority;

        if (triggerCode.startsWith("AFTER_")) {
            title = String.format("[OVERDUE NOTICE] Contact %s for %s renewal (%s)",
                    company.getName(), productName, triggerCode);
            priority = "URGENT";
        } else if ("BEFORE_7".equals(triggerCode) || "BEFORE_15".equals(triggerCode)) {
            title = String.format("[EXPIRING SOON] Follow up with %s for %s renewal (%s)",
                    company.getName(), productName, triggerCode);
            priority = "HIGH";
        } else {
            title = String.format("[RENEWAL REMINDER] Follow up with %s for %s renewal (%s)",
                    company.getName(), productName, triggerCode);
            priority = "MEDIUM";
        }

        String description = String.format(
                "Automated reminder %s triggered on %s for cycle #%d (Expires on %s). Reach out to customer to confirm PO / invoice status.",
                triggerCode, today, cycle.getCycleNo(), cycle.getEndDate()
        );

        taskService.createTask(
                company.getId(),
                cycle,
                title,
                description,
                today.plusDays(2),
                priority,
                "REMINDER",
                company.getAssignedTo() != null ? company.getAssignedTo().getId() : null
        );
    }

    private void updateCycleStatusIfNecessary(ContractCycle cycle, LocalDate today) {
        if (today.isAfter(cycle.getEndDate()) && cycle.getStatus() != CycleStatus.OVERDUE && cycle.getStatus() != CycleStatus.RENEWED) {
            cycle.setStatus(CycleStatus.OVERDUE);
            cycleRepository.save(cycle);
        } else if (today.plusDays(60).isAfter(cycle.getEndDate()) && cycle.getStatus() == CycleStatus.ACTIVE) {
            cycle.setStatus(CycleStatus.RENEWAL_DUE);
            cycleRepository.save(cycle);
        }
    }

    @Transactional
    public void cancelPendingReminders(Long cycleId) {
        log.info("Cancelling all pending reminders and queue items for cycle ID: {}", cycleId);
        reminderLogRepository.cancelAllByCycleId(cycleId);
        emailQueueService.cancelPendingByCycleId(cycleId);
    }
}

