package com.aqs.crm.festival.dto;

import com.aqs.crm.festival.entity.Festival;

import java.time.Instant;
import java.time.LocalDate;

public record FestivalDto(
        Long id,
        String name,
        LocalDate festivalDate,
        String templateKey,
        String customMessage,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
    public static FestivalDto fromEntity(Festival f) {
        return new FestivalDto(
                f.getId(),
                f.getName(),
                f.getFestivalDate(),
                f.getTemplateKey(),
                f.getCustomMessage(),
                Boolean.TRUE.equals(f.getIsActive()),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}

