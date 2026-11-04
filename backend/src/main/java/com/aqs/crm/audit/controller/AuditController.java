package com.aqs.crm.audit.controller;

import com.aqs.crm.audit.dto.AuditLogDto;
import com.aqs.crm.audit.service.AuditService;
import com.aqs.crm.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit Log")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditTrail(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        List<AuditLogDto> auditTrail = auditService.getAuditTrail(entityType.toUpperCase(), entityId);
        return ResponseEntity.ok(ApiResponse.ok(auditTrail));
    }
}

