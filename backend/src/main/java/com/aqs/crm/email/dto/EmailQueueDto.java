package com.aqs.crm.email.dto;

import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailQueue;
import com.aqs.crm.email.entity.QueueStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record EmailQueueDto(
        Long id,
        String toEmail,
        String toName,
        String subject,
        EmailCategory category,
        QueueStatus status,
        Integer retryCount,
        Integer maxRetries,
        String errorMessage,
        LocalDateTime scheduledAt,
        LocalDateTime processedAt,
        Long companyId,
        String companyName,
        Long cycleId,
        Instant createdAt
) {
    public static EmailQueueDto fromEntity(EmailQueue entity) {
        Long companyId = null;
        String companyName = null;
        if (entity.getCompany() != null) {
            companyId = entity.getCompany().getId();
            try {
                companyName = entity.getCompany().getName();
            } catch (Exception ignored) {}
        }

        Long cycleId = entity.getCycle() != null ? entity.getCycle().getId() : null;

        return new EmailQueueDto(
                entity.getId(),
                entity.getToEmail(),
                entity.getToName(),
                entity.getSubject(),
                entity.getCategory(),
                entity.getStatus(),
                entity.getRetryCount(),
                entity.getMaxRetries(),
                entity.getErrorMessage(),
                entity.getScheduledAt(),
                entity.getProcessedAt(),
                companyId,
                companyName,
                cycleId,
                entity.getCreatedAt()
        );
    }
}

