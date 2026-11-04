package com.aqs.crm.contract.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ContractCycleDto(
        Long id,
        Long subscriptionId,
        Integer cycleNo,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal amount,
        String poNumber,
        LocalDate poDate,
        String status,
        Long renewedFromId,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}

