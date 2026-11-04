package com.aqs.crm.email.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.common.dto.PagedResponse;
import com.aqs.crm.email.dto.EmailLogDto;
import com.aqs.crm.email.dto.EmailQueueDto;
import com.aqs.crm.email.dto.EmailTemplateDto;
import com.aqs.crm.email.dto.TestSendRequest;
import com.aqs.crm.email.entity.EmailCategory;
import com.aqs.crm.email.entity.EmailLog;
import com.aqs.crm.email.entity.EmailTemplate;
import com.aqs.crm.email.entity.QueueStatus;
import com.aqs.crm.email.repository.EmailLogRepository;
import com.aqs.crm.email.service.EmailQueueService;
import com.aqs.crm.email.service.EmailSenderService;
import com.aqs.crm.email.service.EmailTemplateService;
import com.aqs.crm.email.service.TemplateRenderer;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emails")
@Tag(name = "Email Engine")
@RequiredArgsConstructor
public class EmailController {

    private final EmailSenderService emailSenderService;
    private final EmailQueueService emailQueueService;
    private final EmailTemplateService emailTemplateService;
    private final EmailLogRepository emailLogRepository;
    private final TemplateRenderer templateRenderer;

    @PostMapping("/test-send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testSend(@Valid @RequestBody TestSendRequest request) {
        String subject = request.customSubject();
        String bodyHtml = request.customBodyHtml();

        if (request.templateKey() != null && !request.templateKey().isBlank()) {
            EmailTemplate template = emailTemplateService.getByTemplateKey(request.templateKey());
            Map<String, Object> sampleVars = new HashMap<>();
            sampleVars.put("company_name", "Acme Corporation (Test)");
            sampleVars.put("contact_name", "John Doe");
            sampleVars.put("product_name", "AQS Industrial Suite v2");
            sampleVars.put("end_date", "2026-12-31");
            sampleVars.put("amount", "₹15,00,000.00");
            sampleVars.put("po_number", "PO-TEST-2026-999");
            sampleVars.put("days_remaining", "30");

            subject = templateRenderer.render(template.getSubject(), sampleVars);
            bodyHtml = templateRenderer.render(template.getBodyHtml(), sampleVars);
        }

        if (subject == null || subject.isBlank()) {
            subject = "AQS CRM Test Email";
        }
        if (bodyHtml == null || bodyHtml.isBlank()) {
            bodyHtml = "<p>This is a test email sent from AQS CRM Email Engine.</p>";
        }

        var sendResult = emailSenderService.sendHtmlEmailWithDetails(
                request.recipientEmail(),
                "Test Recipient",
                subject,
                bodyHtml,
                EmailCategory.TRANSACTIONAL,
                null,
                null,
                null,
                null
        );

        Map<String, Object> result = new HashMap<>();
        result.put("recipient", request.recipientEmail());
        result.put("subject", subject);
        result.put("success", sendResult.success());
        if (sendResult.errorMessage() != null) {
            result.put("errorMessage", sendResult.errorMessage());
        }

        if (sendResult.success()) {
            return ResponseEntity.ok(ApiResponse.ok("Test email dispatched and delivered successfully", result));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    "SMTP dispatch failed: " + sendResult.errorMessage(),
                    result
            ));
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<EmailTemplateDto>>> getTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(emailTemplateService.getAllTemplates()));
    }

    @GetMapping("/queue")
    public ResponseEntity<PagedResponse<EmailQueueDto>> getQueue(
            @RequestParam(required = false) QueueStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(emailQueueService.getQueue(status, pageable));
    }

    @PostMapping("/queue/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processQueue() {
        int processed = emailQueueService.processPendingQueue();
        return ResponseEntity.ok(ApiResponse.ok("Queue processed", Map.of("processedCount", processed)));
    }

    @GetMapping("/logs")
    public ResponseEntity<PagedResponse<EmailLogDto>> getLogs(
            @PageableDefault(sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<EmailLog> page = emailLogRepository.findAllByOrderBySentAtDesc(pageable);
        List<EmailLogDto> dtos = page.getContent().stream().map(EmailLogDto::fromEntity).toList();
        return ResponseEntity.ok(PagedResponse.of(page, dtos));
    }
}

