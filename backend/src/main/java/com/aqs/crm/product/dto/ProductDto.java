package com.aqs.crm.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductDto(
        Long id,
        String name,
        String description,
        String currentVersion,
        BigDecimal annualPrice,
        boolean isActive,
        LocalDateTime createdAt
) {
}
