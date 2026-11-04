package com.aqs.crm.pipeline.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.company.dto.CompanyDto;
import com.aqs.crm.pipeline.dto.StageChangeRequest;
import com.aqs.crm.pipeline.dto.StageHistoryDto;
import com.aqs.crm.pipeline.service.PipelineService;
import com.aqs.crm.security.CurrentUser;
import com.aqs.crm.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/pipeline")
@Tag(name = "Pipeline")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @PutMapping
    public ResponseEntity<ApiResponse<CompanyDto>> changeStage(
            @PathVariable Long companyId,
            @Valid @RequestBody StageChangeRequest request,
            @CurrentUser UserPrincipal currentUser) {
        CompanyDto company = pipelineService.changeStage(companyId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Pipeline stage updated successfully", company));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<StageHistoryDto>>> getStageHistory(@PathVariable Long companyId) {
        List<StageHistoryDto> history = pipelineService.getStageHistory(companyId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}

