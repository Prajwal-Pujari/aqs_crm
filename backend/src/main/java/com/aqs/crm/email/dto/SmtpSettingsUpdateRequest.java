package com.aqs.crm.email.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SmtpSettingsUpdateRequest(
        @NotBlank(message = "SMTP host is required")
        String host,

        @NotNull(message = "SMTP port is required")
        Integer port,

        String protocol,

        @NotBlank(message = "SMTP username is required")
        String username,

        String password,

        String fromEmail,
        String fromName,

        Boolean starttlsEnabled,
        Boolean sslEnabled
) {
}

