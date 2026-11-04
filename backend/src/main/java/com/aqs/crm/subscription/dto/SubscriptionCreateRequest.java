package com.aqs.crm.subscription.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SubscriptionCreateRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        LocalDate installDate,

        @Size(max = 50, message = "Version must be at most 50 characters")
        String version,

        @Size(max = 255, message = "Site must be at most 255 characters")
        String site
) {
}

