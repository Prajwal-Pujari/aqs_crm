package com.aqs.crm.email.dto;

import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailLog;

import java.time.Instant;

public record EmailLogDto(
        Long id,
        Long queueId,
        String toEmail,
        String toName,
        String subject,
        EmailCategory category,
        String status,
        String errorMessage,
        Long companyId,
        String companyName,
        Long cycleId,
        Instant sentAt
) {
    public static EmailLogDto fromEntity(EmailLog entity) {
        Long companyId = null;
        String companyName = null;
        if (entity.getCompany() != null) {
            companyId = entity.getCompany().getId();
            try {
                companyName = entity.getCompany().getName();
            } catch (Exception ignored) {}
        }

        Long cycleId = entity.getCycle() != null ? entity.getCycle().getId() : null;
        Long queueId = entity.getQueue() != null ? entity.getQueue().getId() : null;

        return new EmailLogDto(
                entity.getId(),
                queueId,
                entity.getToEmail(),
                entity.getToName(),
                entity.getSubject(),
                entity.getCategory(),
                entity.getStatus(),
                entity.getErrorMessage(),
                companyId,
                companyName,
                cycleId,
                entity.getSentAt()
        );
    }
}

