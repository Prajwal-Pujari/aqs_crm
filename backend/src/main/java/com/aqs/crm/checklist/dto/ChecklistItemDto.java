package com.aqs.crm.checklist.dto;

import java.time.Instant;

public record ChecklistItemDto(
        Long id,
        Long companyId,
        String title,
        String description,
        Boolean isCompleted,
        Instant completedAt,
        String completedByName,
        Integer sortOrder,
        Instant createdAt
) {
}

