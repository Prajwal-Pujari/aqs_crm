package com.aqs.crm.task.dto;

import com.aqs.crm.task.entity.Task;

import java.time.Instant;
import java.time.LocalDate;

public record TaskDto(
        Long id,
        Long companyId,
        String companyName,
        Long cycleId,
        String title,
        String description,
        LocalDate dueDate,
        Boolean isCompleted,
        Instant completedAt,
        Long assignedToId,
        String assignedToName,
        String priority,
        String source,
        Instant createdAt
) {
    public static TaskDto fromEntity(Task entity) {
        Long companyId = null;
        String companyName = null;
        if (entity.getCompany() != null) {
            companyId = entity.getCompany().getId();
            try {
                companyName = entity.getCompany().getName();
            } catch (Exception ignored) {}
        }

        Long assignedToId = null;
        String assignedToName = null;
        if (entity.getAssignedTo() != null) {
            assignedToId = entity.getAssignedTo().getId();
            try {
                assignedToName = entity.getAssignedTo().getFullName() != null
                        ? entity.getAssignedTo().getFullName()
                        : entity.getAssignedTo().getUsername();
            } catch (Exception ignored) {}
        }

        Long cycleId = entity.getCycle() != null ? entity.getCycle().getId() : null;

        return new TaskDto(
                entity.getId(),
                companyId,
                companyName,
                cycleId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getDueDate(),
                entity.getIsCompleted(),
                entity.getCompletedAt(),
                assignedToId,
                assignedToName,
                entity.getPriority(),
                entity.getSource(),
                entity.getCreatedAt()
        );
    }
}

