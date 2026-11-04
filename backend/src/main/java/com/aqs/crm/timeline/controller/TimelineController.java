package com.aqs.crm.timeline.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.timeline.dto.TimelineEventDto;
import com.aqs.crm.timeline.service.TimelineService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/timeline")
@Tag(name = "Timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimelineEventDto>>> getTimeline(@PathVariable Long companyId) {
        List<TimelineEventDto> timeline = timelineService.getCompanyTimeline(companyId);
        return ResponseEntity.ok(ApiResponse.ok(timeline));
    }
}

