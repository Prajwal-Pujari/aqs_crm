package com.aqs.crm.audit.dto;

import com.aqs.crm.audit.entity.AuditLog;

import java.time.Instant;

public record AuditLogDto(
        Long id,
        String entityType,
        Long entityId,
        String action,
        String fieldName,
        String oldValue,
        String newValue,
        Long changedById,
        String changedByName,
        Instant createdAt
) {
    public static AuditLogDto fromEntity(AuditLog log) {
        Long changedById = null;
        String changedByName = null;
        if (log.getChangedBy() != null) {
            changedById = log.getChangedBy().getId();
            try {
                changedByName = log.getChangedBy().getFullName() != null
                        ? log.getChangedBy().getFullName()
                        : log.getChangedBy().getUsername();
            } catch (Exception e) {
                changedByName = "User #" + changedById;
            }
        }

        return new AuditLogDto(
                log.getId(),
                log.getEntityType(),
                log.getEntityId(),
                log.getAction(),
                log.getFieldName(),
                log.getOldValue(),
                log.getNewValue(),
                changedById,
                changedByName,
                log.getCreatedAt()
        );
    }
}

