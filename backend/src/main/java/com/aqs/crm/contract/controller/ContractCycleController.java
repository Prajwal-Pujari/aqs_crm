package com.aqs.crm.contract.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.contract.dto.ContractCycleCreateRequest;
import com.aqs.crm.contract.dto.ContractCycleDto;
import com.aqs.crm.contract.dto.RenewRequest;
import com.aqs.crm.contract.service.ContractCycleService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions/{subscriptionId}/cycles")
@Tag(name = "Contract Cycles")
@RequiredArgsConstructor
public class ContractCycleController {

    private final ContractCycleService contractCycleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContractCycleDto>>> getCycles(@PathVariable Long subscriptionId) {
        List<ContractCycleDto> list = contractCycleService.getCyclesBySubscription(subscriptionId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractCycleDto>> getCycle(
            @PathVariable Long subscriptionId,
            @PathVariable Long id) {
        ContractCycleDto dto = contractCycleService.getCycleById(subscriptionId, id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContractCycleDto>> createFirstCycle(
            @PathVariable Long subscriptionId,
            @Valid @RequestBody ContractCycleCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ContractCycleDto dto = contractCycleService.createFirstCycle(subscriptionId, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contract cycle created successfully", dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractCycleDto>> updateCycle(
            @PathVariable Long subscriptionId,
            @PathVariable Long id,
            @Valid @RequestBody ContractCycleCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ContractCycleDto dto = contractCycleService.updateCycle(subscriptionId, id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Contract cycle updated successfully", dto));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<ContractCycleDto>> renewCycle(
            @PathVariable Long subscriptionId,
            @PathVariable Long id,
            @Valid @RequestBody RenewRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ContractCycleDto dto = contractCycleService.renewCycle(subscriptionId, id, request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Subscription renewed successfully", dto));
    }
}

