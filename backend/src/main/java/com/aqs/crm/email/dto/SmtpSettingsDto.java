package com.aqs.crm.email.dto;

import com.aqs.crm.email.entity.SmtpSettings;

import java.time.Instant;

public record SmtpSettingsDto(
        Long id,
        String host,
        Integer port,
        String protocol,
        String username,
        boolean hasPassword,
        String fromEmail,
        String fromName,
        boolean starttlsEnabled,
        boolean sslEnabled,
        boolean isActive,
        Instant updatedAt
) {
    public static SmtpSettingsDto fromEntity(SmtpSettings s) {
        return new SmtpSettingsDto(
                s.getId(),
                s.getHost(),
                s.getPort(),
                s.getProtocol(),
                s.getUsername(),
                s.getPassword() != null && !s.getPassword().isBlank(),
                s.getFromEmail(),
                s.getFromName(),
                Boolean.TRUE.equals(s.getStarttlsEnabled()),
                Boolean.TRUE.equals(s.getSslEnabled()),
                Boolean.TRUE.equals(s.getIsActive()),
                s.getUpdatedAt()
        );
    }
}

