package com.aqs.crm.email.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.email.dto.SmtpSettingsDto;
import com.aqs.crm.email.dto.SmtpSettingsUpdateRequest;
import com.aqs.crm.email.service.SmtpSettingsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/smtp")
@Tag(name = "SMTP Settings")
@RequiredArgsConstructor
public class SmtpSettingsController {

    private final SmtpSettingsService smtpSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<SmtpSettingsDto>> getSmtpSettings() {
        SmtpSettingsDto dto = smtpSettingsService.getSettingsDto();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SmtpSettingsDto>> updateSmtpSettings(
            @Valid @RequestBody SmtpSettingsUpdateRequest request) {
        SmtpSettingsDto dto = smtpSettingsService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.ok("SMTP mailbox configuration saved to database successfully", dto));
    }
}

