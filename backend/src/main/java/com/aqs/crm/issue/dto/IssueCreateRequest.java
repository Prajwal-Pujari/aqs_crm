package com.aqs.crm.issue.dto;

import com.aqs.crm.issue.entity.IssuePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IssueCreateRequest(
        Long reportedByContactId,
        Long assignedToUserId,

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        IssuePriority priority
) {
    public IssueCreateRequest {
        if (priority == null) {
            priority = IssuePriority.MEDIUM;
        }
    }
}

