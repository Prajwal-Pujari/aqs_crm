package com.aqs.crm.reminder.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.reminder.dto.ReminderConfigDto;
import com.aqs.crm.reminder.dto.ReminderLogDto;
import com.aqs.crm.reminder.repository.ReminderConfigRepository;
import com.aqs.crm.reminder.repository.ReminderLogRepository;
import com.aqs.crm.reminder.service.RenewalReminderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Renewal Reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final RenewalReminderService renewalReminderService;
    private final ReminderConfigRepository configRepository;
    private final ReminderLogRepository reminderLogRepository;

    @GetMapping("/configs")
    public ResponseEntity<ApiResponse<List<ReminderConfigDto>>> getConfigs() {
        List<ReminderConfigDto> configs = configRepository.findActiveConfigsWithTemplate()
                .stream()
                .map(ReminderConfigDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(configs));
    }

    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerReminderEvaluation(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate evaluationDate) {
        LocalDate date = evaluationDate != null ? evaluationDate : LocalDate.now();
        int triggered = renewalReminderService.processRemindersForDate(date);

        Map<String, Object> result = new HashMap<>();
        result.put("evaluationDate", date);
        result.put("remindersTriggered", triggered);

        return ResponseEntity.ok(ApiResponse.ok("Renewal reminders evaluation triggered successfully", result));
    }

    @GetMapping("/logs/{cycleId}")
    public ResponseEntity<ApiResponse<List<ReminderLogDto>>> getReminderLogsForCycle(@PathVariable Long cycleId) {
        List<ReminderLogDto> logs = reminderLogRepository.findByCycleId(cycleId)
                .stream()
                .map(ReminderLogDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
