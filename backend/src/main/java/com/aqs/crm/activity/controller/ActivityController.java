package com.aqs.crm.activity.controller;

import com.aqs.crm.activity.dto.ActivityCreateRequest;
import com.aqs.crm.activity.dto.ActivityDto;
import com.aqs.crm.activity.service.ActivityService;
import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.security.CurrentUser;
import com.aqs.crm.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/activities")
@Tag(name = "Activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getActivities(@PathVariable Long companyId) {
        List<ActivityDto> activities = activityService.getActivitiesByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDto>> logActivity(
            @PathVariable Long companyId,
            @Valid @RequestBody ActivityCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {

        ActivityDto activity = activityService.logActivity(companyId, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Activity logged successfully", activity));
    }
}

