package com.aqs.crm.dashboard.dto;

import com.aqs.crm.contract.entity.ContractCycle;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record UpcomingRenewalSummaryDto(
        Long cycleId,
        Long subscriptionId,
        Long companyId,
        String companyName,
        Long productId,
        String productName,
        Integer cycleNo,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal amount,
        String status,
        long daysRemaining
) {
    public static UpcomingRenewalSummaryDto fromEntity(ContractCycle cycle) {
        long daysRemaining = 0;
        if (cycle.getEndDate() != null) {
            daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), cycle.getEndDate());
        }

        String companyName = "Unknown";
        Long companyId = null;
        String productName = "Unknown";
        Long productId = null;
        Long subId = null;

        if (cycle.getSubscription() != null) {
            subId = cycle.getSubscription().getId();
            if (cycle.getSubscription().getCompany() != null) {
                companyId = cycle.getSubscription().getCompany().getId();
                companyName = cycle.getSubscription().getCompany().getName();
            }
            if (cycle.getSubscription().getProduct() != null) {
                productId = cycle.getSubscription().getProduct().getId();
                productName = cycle.getSubscription().getProduct().getName();
            }
        }

        return new UpcomingRenewalSummaryDto(
                cycle.getId(),
                subId,
                companyId,
                companyName,
                productId,
                productName,
                cycle.getCycleNo(),
                cycle.getStartDate(),
                cycle.getEndDate(),
                cycle.getAmount(),
                cycle.getStatus() != null ? cycle.getStatus().name() : "UNKNOWN",
                daysRemaining
        );
    }
}

