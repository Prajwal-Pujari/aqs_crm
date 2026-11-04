package com.aqs.crm.subscription.dto;

import java.time.Instant;
import java.time.LocalDate;

public record SubscriptionDto(
        Long id,
        Long companyId,
        String companyName,
        Long productId,
        String productName,
        LocalDate installDate,
        String version,
        String site,
        Boolean isActive,
        String latestCycleStatus,
        Instant createdAt,
        Instant updatedAt
) {
}

