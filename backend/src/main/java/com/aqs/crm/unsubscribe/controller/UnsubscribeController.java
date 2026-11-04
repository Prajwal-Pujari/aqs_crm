package com.aqs.crm.unsubscribe.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.unsubscribe.dto.ContactPreferenceDto;
import com.aqs.crm.unsubscribe.dto.UnsubscribeUpdateRequest;
import com.aqs.crm.unsubscribe.service.UnsubscribeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/unsubscribe")
@Tag(name = "Unsubscribe & Communication Preferences")
@RequiredArgsConstructor
public class UnsubscribeController {

    private final UnsubscribeService unsubscribeService;

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse<ContactPreferenceDto>> getPreferences(@PathVariable String token) {
        ContactPreferenceDto dto = unsubscribeService.getPreferences(token);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/{token}")
    public ResponseEntity<ApiResponse<ContactPreferenceDto>> updatePreferences(
            @PathVariable String token,
            @RequestBody UnsubscribeUpdateRequest request) {
        ContactPreferenceDto updated = unsubscribeService.updatePreferences(token, request);
        return ResponseEntity.ok(ApiResponse.ok("Communication preferences successfully updated", updated));
    }
}

