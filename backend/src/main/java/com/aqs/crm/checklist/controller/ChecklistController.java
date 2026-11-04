package com.aqs.crm.checklist.controller;

import com.aqs.crm.checklist.dto.ChecklistItemDto;
import com.aqs.crm.checklist.service.InstallationChecklistService;
import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.security.CurrentUser;
import com.aqs.crm.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/checklist")
@Tag(name = "Installation Checklist")
@RequiredArgsConstructor
public class ChecklistController {

    private final InstallationChecklistService checklistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChecklistItemDto>>> getChecklist(@PathVariable Long companyId) {
        List<ChecklistItemDto> list = checklistService.getChecklist(companyId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{itemId}/toggle")
    public ResponseEntity<ApiResponse<ChecklistItemDto>> toggleItem(
            @PathVariable Long companyId,
            @PathVariable Long itemId,
            @CurrentUser UserPrincipal currentUser) {
        ChecklistItemDto item = checklistService.toggleItem(companyId, itemId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Checklist item updated", item));
    }
}

