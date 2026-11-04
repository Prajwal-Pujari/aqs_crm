package com.aqs.crm.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactCreateRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must be at most 100 characters")
        String firstName,

        @Size(max = 100, message = "Last name must be at most 100 characters")
        String lastName,

        @Email(message = "Invalid email format")
        String email,

        String phone,
        String role,
        Boolean isBilling,
        Boolean optedInGreetings,
        Boolean optedInPromos,
        String notes
) {
}

