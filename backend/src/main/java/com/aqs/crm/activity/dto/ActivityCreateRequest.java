package com.aqs.crm.activity.dto;

import com.aqs.crm.activity.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ActivityCreateRequest(
        Long contactId,

        @NotNull(message = "Activity type is required")
        ActivityType type,

        @NotBlank(message = "Subject is required")
        @Size(max = 255, message = "Subject must be at most 255 characters")
        String subject,

        String details,

        @Size(max = 100, message = "Outcome must be at most 100 characters")
        String outcome,

        LocalDate nextFollowUp
) {
}

