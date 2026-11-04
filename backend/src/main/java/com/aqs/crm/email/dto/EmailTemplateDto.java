package com.aqs.crm.email.dto;

import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailTemplate;

import java.time.Instant;

public record EmailTemplateDto(
        Long id,
        String templateKey,
        String subject,
        String bodyHtml,
        EmailCategory category,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmailTemplateDto fromEntity(EmailTemplate entity) {
        return new EmailTemplateDto(
                entity.getId(),
                entity.getTemplateKey(),
                entity.getSubject(),
                entity.getBodyHtml(),
                entity.getCategory(),
                entity.getIsActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

