package com.aqs.crm.issue.dto;

import com.aqs.crm.issue.entity.IssuePriority;
import com.aqs.crm.issue.entity.IssueStatus;

public record IssueUpdateRequest(
        Long assignedToUserId,
        String title,
        String description,
        IssuePriority priority,
        IssueStatus status,
        String resolutionNotes
) {
}

