package com.aqs.crm.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TestSendRequest(
        @NotBlank(message = "Recipient email is required")
        @Email(message = "Invalid email format")
        String recipientEmail,

        String templateKey,

        String customSubject,

        String customBodyHtml
) {
}

