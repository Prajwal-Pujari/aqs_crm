package com.aqs.crm.festival.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.festival.dto.FestivalCreateRequest;
import com.aqs.crm.festival.dto.FestivalDto;
import com.aqs.crm.festival.dto.FestivalUpdateRequest;
import com.aqs.crm.festival.service.FestivalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/festivals")
@Tag(name = "Festivals & Greetings")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService festivalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FestivalDto>>> getAllFestivals() {
        return ResponseEntity.ok(ApiResponse.ok(festivalService.getAllFestivals()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FestivalDto>> getFestival(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(festivalService.getFestival(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    public ResponseEntity<ApiResponse<FestivalDto>> createFestival(
            @Valid @RequestBody FestivalCreateRequest request) {
        FestivalDto created = festivalService.createFestival(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Festival created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    public ResponseEntity<ApiResponse<FestivalDto>> updateFestival(
            @PathVariable Long id,
            @Valid @RequestBody FestivalUpdateRequest request) {
        FestivalDto updated = festivalService.updateFestival(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Festival updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFestival(@PathVariable Long id) {
        festivalService.deleteFestival(id);
        return ResponseEntity.ok(ApiResponse.ok("Festival deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    public ResponseEntity<ApiResponse<FestivalDto>> toggleFestival(@PathVariable Long id) {
        FestivalDto toggled = festivalService.toggleFestival(id);
        return ResponseEntity.ok(ApiResponse.ok("Festival status toggled", toggled));
    }

    @PostMapping("/{id}/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerFestivalGreetings(@PathVariable Long id) {
        int queued = festivalService.triggerGreetingsForFestival(id);
        return ResponseEntity.ok(ApiResponse.ok(
                "Greetings dispatched to email queue",
                Map.of("festivalId", id, "greetingsQueued", queued)
        ));
    }

    @PostMapping("/run-daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runDailyCheck(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate evaluationDate) {
        LocalDate date = evaluationDate != null ? evaluationDate : LocalDate.now();
        int queued = festivalService.evaluateAndDispatchDailyGreetings(date);
        return ResponseEntity.ok(ApiResponse.ok(
                "Daily festival greeting check completed",
                Map.of("date", date, "greetingsQueued", queued)
        ));
    }
}

