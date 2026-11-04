package com.aqs.crm.task.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.security.CurrentUser;
import com.aqs.crm.security.UserPrincipal;
import com.aqs.crm.task.dto.TaskCreateRequest;
import com.aqs.crm.task.dto.TaskDto;
import com.aqs.crm.task.service.TaskService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final ContractCycleRepository contractCycleRepository;

    @GetMapping("/companies/{companyId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getCompanyTasks(@PathVariable Long companyId) {
        List<TaskDto> list = taskService.getTasksByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/companies/{companyId}/tasks")
    public ResponseEntity<ApiResponse<TaskDto>> createCompanyTask(
            @PathVariable Long companyId,
            @Valid @RequestBody TaskCreateRequest request,
            @CurrentUser UserPrincipal currentUser) {

        ContractCycle cycle = null;
        if (request.cycleId() != null) {
            cycle = contractCycleRepository.findById(request.cycleId()).orElse(null);
        }

        TaskDto task = taskService.createTask(
                companyId,
                cycle,
                request.title(),
                request.description(),
                request.dueDate(),
                request.priority(),
                "MANUAL",
                request.assignedToId() != null ? request.assignedToId() : currentUser.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully", task));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAllTasks() {
        List<TaskDto> list = taskService.getAllTasks();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/tasks/{taskId}/toggle")
    public ResponseEntity<ApiResponse<TaskDto>> toggleTask(@PathVariable Long taskId) {
        TaskDto task = taskService.toggleTask(taskId);
        return ResponseEntity.ok(ApiResponse.ok(task.isCompleted() ? "Task marked completed" : "Task marked active", task));
    }
}

