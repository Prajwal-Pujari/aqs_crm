package com.aqs.crm.issue.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.issue.dto.IssueCreateRequest;
import com.aqs.crm.issue.dto.IssueDto;
import com.aqs.crm.issue.dto.IssueUpdateRequest;
import com.aqs.crm.issue.service.IssueService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping("/companies/{companyId}/issues")
    public ResponseEntity<ApiResponse<List<IssueDto>>> getCompanyIssues(@PathVariable Long companyId) {
        List<IssueDto> list = issueService.getIssuesByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/companies/{companyId}/issues")
    public ResponseEntity<ApiResponse<IssueDto>> createCompanyIssue(
            @PathVariable Long companyId,
            @Valid @RequestBody IssueCreateRequest request) {

        IssueDto issue = issueService.createIssue(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Support issue logged successfully", issue));
    }

    @GetMapping("/issues")
    public ResponseEntity<ApiResponse<List<IssueDto>>> getAllIssues() {
        List<IssueDto> list = issueService.getAllIssues();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/issues/{issueId}")
    public ResponseEntity<ApiResponse<IssueDto>> updateIssue(
            @PathVariable Long issueId,
            @RequestBody IssueUpdateRequest request) {

        IssueDto issue = issueService.updateIssue(issueId, request);
        return ResponseEntity.ok(ApiResponse.ok("Issue updated successfully", issue));
    }
}

