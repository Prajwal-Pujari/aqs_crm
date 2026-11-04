package com.aqs.crm.pipeline.dto;

import java.time.Instant;

public record StageHistoryDto(
        Long id,
        Long companyId,
        String fromStage,
        String toStage,
        String changedByName,
        String notes,
        Instant createdAt
) {
}

