package com.aqs.crm.festival.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record FestivalCreateRequest(
        @NotBlank(message = "Festival name is required")
        String name,

        @NotNull(message = "Festival date is required")
        LocalDate festivalDate,

        String templateKey,
        String customMessage,
        Boolean isActive
) {
}

