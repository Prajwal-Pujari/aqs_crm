package com.aqs.crm.task.service;

import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.company.entity.Company;
import com.aqs.crm.company.repository.CompanyRepository;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.task.dto.TaskDto;
import com.aqs.crm.task.entity.Task;
import com.aqs.crm.task.repository.TaskRepository;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskDto createTask(Long companyId, ContractCycle cycle, String title, String description,
                              LocalDate dueDate, String priority, String source, Long assignedToId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        User assignedTo = null;
        if (assignedToId != null) {
            assignedTo = userRepository.findById(assignedToId).orElse(null);
        } else if (company.getAssignedTo() != null) {
            assignedTo = company.getAssignedTo();
        }

        Task task = Task.builder()
                .company(company)
                .cycle(cycle)
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .priority(priority != null ? priority : "MEDIUM")
                .source(source != null ? source : "MANUAL")
                .assignedTo(assignedTo)
                .isCompleted(false)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Created internal task: '{}' for company '{}' (due: {})", title, company.getName(), dueDate);
        return TaskDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByCompany(Long companyId) {
        return taskRepository.findByCompanyIdWithDetails(companyId)
                .stream()
                .map(TaskDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAllWithDetails()
                .stream()
                .map(TaskDto::fromEntity)
                .toList();
    }

    @Transactional
    public TaskDto toggleTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        boolean newState = !Boolean.TRUE.equals(task.getIsCompleted());
        task.setIsCompleted(newState);
        task.setCompletedAt(newState ? Instant.now() : null);

        return TaskDto.fromEntity(taskRepository.save(task));
    }
}

