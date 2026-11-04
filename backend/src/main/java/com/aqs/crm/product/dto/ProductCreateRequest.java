package com.aqs.crm.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductCreateRequest(
        @NotBlank(message = "Product name is required")
        String name,

        String description,

        String currentVersion,

        @NotNull(message = "Annual price is required")
        @DecimalMin(value = "0.01", message = "Annual price must be at least 0.01")
        BigDecimal annualPrice
) {
}
