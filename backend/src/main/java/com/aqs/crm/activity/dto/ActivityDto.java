package com.aqs.crm.activity.dto;

import com.aqs.crm.activity.entity.Activity;
import com.aqs.crm.activity.entity.ActivityType;

import java.time.Instant;
import java.time.LocalDate;

public record ActivityDto(
        Long id,
        Long companyId,
        String companyName,
        Long contactId,
        String contactName,
        Long userId,
        String userName,
        ActivityType type,
        String subject,
        String details,
        String outcome,
        LocalDate nextFollowUp,
        Instant createdAt,
        Instant updatedAt
) {
    public static ActivityDto fromEntity(Activity a) {
        String contactName = null;
        if (a.getContact() != null) {
            contactName = (a.getContact().getFirstName() + " " +
                    (a.getContact().getLastName() != null ? a.getContact().getLastName() : "")).trim();
        }

        return new ActivityDto(
                a.getId(),
                a.getCompany() != null ? a.getCompany().getId() : null,
                a.getCompany() != null ? a.getCompany().getName() : null,
                a.getContact() != null ? a.getContact().getId() : null,
                contactName,
                a.getUser() != null ? a.getUser().getId() : null,
                a.getUser() != null ? a.getUser().getFullName() : null,
                a.getType(),
                a.getSubject(),
                a.getDetails(),
                a.getOutcome(),
                a.getNextFollowUp(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}

