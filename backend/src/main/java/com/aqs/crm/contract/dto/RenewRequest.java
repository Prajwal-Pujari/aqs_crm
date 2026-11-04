package com.aqs.crm.contract.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RenewRequest(
        LocalDate startDate, // Optional: defaults to previous cycle's endDate + 1 day

        LocalDate endDate,   // Optional: defaults to startDate + 1 year - 1 day

        @DecimalMin(value = "0.00", message = "Amount cannot be negative")
        BigDecimal amount,   // Optional: defaults to previous cycle's amount if not provided

        @Size(max = 100, message = "PO number cannot exceed 100 characters")
        String poNumber,

        LocalDate poDate,

        String notes
) {
}

