package com.aqs.crm.subscription.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.subscription.dto.SubscriptionCreateRequest;
import com.aqs.crm.subscription.dto.SubscriptionDto;
import com.aqs.crm.subscription.service.SubscriptionService;
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
@RequestMapping("/api/companies/{companyId}/subscriptions")
@Tag(name = "Subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getSubscriptions(@PathVariable Long companyId) {
        List<SubscriptionDto> list = subscriptionService.getByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscription(
            @PathVariable Long companyId,
            @PathVariable Long id) {
        SubscriptionDto dto = subscriptionService.getById(companyId, id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionDto>> createSubscription(
            @PathVariable Long companyId,
            @Valid @RequestBody SubscriptionCreateRequest request) {
        SubscriptionDto dto = subscriptionService.create(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Subscription created successfully", dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionDto>> updateSubscription(
            @PathVariable Long companyId,
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionCreateRequest request) {
        SubscriptionDto dto = subscriptionService.update(companyId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated successfully", dto));
    }
}

