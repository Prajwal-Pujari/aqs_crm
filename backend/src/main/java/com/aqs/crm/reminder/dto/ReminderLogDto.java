package com.aqs.crm.reminder.dto;

import com.aqs.crm.reminder.entity.ReminderLog;

import java.time.Instant;

public record ReminderLogDto(
        Long id,
        Long cycleId,
        String reminderType,
        Long contactId,
        String contactName,
        String contactEmail,
        Long emailQueueId,
        Boolean isCancelled,
        Instant sentAt
) {
    public static ReminderLogDto fromEntity(ReminderLog log) {
        Long contactId = null;
        String contactName = null;
        String contactEmail = null;
        if (log.getContact() != null) {
            contactId = log.getContact().getId();
            try {
                contactName = (log.getContact().getFirstName() + " " +
                        (log.getContact().getLastName() != null ? log.getContact().getLastName() : "")).trim();
                contactEmail = log.getContact().getEmail();
            } catch (Exception ignored) {}
        }
        Long cycleId = log.getCycle() != null ? log.getCycle().getId() : null;
        Long queueId = log.getEmailQueue() != null ? log.getEmailQueue().getId() : null;

        return new ReminderLogDto(
                log.getId(),
                cycleId,
                log.getReminderType(),
                contactId,
                contactName,
                contactEmail,
                queueId,
                log.getIsCancelled(),
                log.getSentAt()
        );
    }
}

