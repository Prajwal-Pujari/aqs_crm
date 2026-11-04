package com.aqs.crm.audit.service;

import com.aqs.crm.audit.dto.AuditLogDto;
import com.aqs.crm.audit.entity.AuditLog;
import com.aqs.crm.audit.repository.AuditLogRepository;
import com.aqs.crm.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logChange(String entityType, Long entityId, String action, String fieldName,
                          String oldValue, String newValue, Long userId) {
        User user = null;
        if (userId != null) {
            user = new User();
            user.setId(userId);
        }

        AuditLog entry = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .changedBy(user)
                .build();

        auditLogRepository.save(entry);
        log.debug("Audit logged: {} #{} {} field={}", entityType, entityId, action, fieldName);
    }

    @Transactional
    public void logCreate(String entityType, Long entityId, Long userId) {
        logChange(entityType, entityId, "CREATE", null, null, null, userId);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditTrail(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }
}

