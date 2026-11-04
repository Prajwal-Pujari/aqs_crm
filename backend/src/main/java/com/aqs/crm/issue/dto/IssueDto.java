package com.aqs.crm.issue.dto;

import com.aqs.crm.issue.entity.Issue;
import com.aqs.crm.issue.entity.IssuePriority;
import com.aqs.crm.issue.entity.IssueStatus;

import java.time.Instant;

public record IssueDto(
        Long id,
        Long companyId,
        String companyName,
        Long reportedByContactId,
        String reportedByContactName,
        Long assignedToUserId,
        String assignedToUserName,
        String title,
        String description,
        IssuePriority priority,
        IssueStatus status,
        String resolutionNotes,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static IssueDto fromEntity(Issue issue) {
        String contactName = null;
        if (issue.getReportedByContact() != null) {
            contactName = (issue.getReportedByContact().getFirstName() + " " +
                    (issue.getReportedByContact().getLastName() != null ? issue.getReportedByContact().getLastName() : "")).trim();
        }

        return new IssueDto(
                issue.getId(),
                issue.getCompany() != null ? issue.getCompany().getId() : null,
                issue.getCompany() != null ? issue.getCompany().getName() : null,
                issue.getReportedByContact() != null ? issue.getReportedByContact().getId() : null,
                contactName,
                issue.getAssignedToUser() != null ? issue.getAssignedToUser().getId() : null,
                issue.getAssignedToUser() != null ? issue.getAssignedToUser().getFullName() : null,
                issue.getTitle(),
                issue.getDescription(),
                issue.getPriority(),
                issue.getStatus(),
                issue.getResolutionNotes(),
                issue.getResolvedAt(),
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }
}

