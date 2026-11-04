package com.aqs.crm.subscription.service;

import com.aqs.crm.common.exception.ConflictException;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.product.entity.Product;
import com.aqs.crm.product.repository.ProductRepository;
import com.aqs.crm.subscription.dto.SubscriptionCreateRequest;
import com.aqs.crm.subscription.dto.SubscriptionDto;
import com.aqs.crm.subscription.entity.Subscription;
import com.aqs.crm.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<SubscriptionDto> getByCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company", "id", companyId);
        }
        return subscriptionRepository.findByCompanyId(companyId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionDto getById(Long companyId, Long id) {
        Subscription subscription = subscriptionRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));
        return toDto(subscription);
    }

    @Transactional
    public SubscriptionDto create(Long companyId, SubscriptionCreateRequest req) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", req.productId()));

        if (subscriptionRepository.existsByCompanyIdAndProductId(companyId, req.productId())) {
            throw new ConflictException("Subscription for this product already exists for this company");
        }

        Subscription subscription = Subscription.builder()
                .company(company)
                .product(product)
                .installDate(req.installDate())
                .version(req.version() != null ? req.version() : product.getCurrentVersion())
                .site(req.site())
                .isActive(true)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Created subscription id={} for company={}", saved.getId(), companyId);
        return toDto(saved);
    }

    @Transactional
    public SubscriptionDto update(Long companyId, Long id, SubscriptionCreateRequest req) {
        Subscription subscription = subscriptionRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        if (req.installDate() != null) {
            subscription.setInstallDate(req.installDate());
        }
        if (req.version() != null) {
            subscription.setVersion(req.version());
        }
        if (req.site() != null) {
            subscription.setSite(req.site());
        }

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Updated subscription id={} for company={}", saved.getId(), companyId);
        return toDto(saved);
    }

    public SubscriptionDto toDto(Subscription sub) {
        String latestCycleStatus = null;
        if (sub.getContractCycles() != null && !sub.getContractCycles().isEmpty()) {
            latestCycleStatus = sub.getContractCycles().stream()
                    .max(Comparator.comparingInt(ContractCycle::getCycleNo))
                    .map(c -> c.getStatus().name())
                    .orElse(null);
        }

        return new SubscriptionDto(
                sub.getId(),
                sub.getCompany().getId(),
                sub.getCompany().getName(),
                sub.getProduct().getId(),
                sub.getProduct().getName(),
                sub.getInstallDate(),
                sub.getVersion(),
                sub.getSite(),
                sub.getIsActive(),
                latestCycleStatus,
                sub.getCreatedAt(),
                sub.getUpdatedAt()
        );
    }
}

