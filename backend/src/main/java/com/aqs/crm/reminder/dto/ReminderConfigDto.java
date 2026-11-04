package com.aqs.crm.reminder.dto;

import com.aqs.crm.reminder.entity.ReminderConfig;

public record ReminderConfigDto(
        Long id,
        String triggerCode,
        Integer daysOffset,
        Long templateId,
        String templateKey,
        Boolean isActive
) {
    public static ReminderConfigDto fromEntity(ReminderConfig config) {
        Long templateId = null;
        String templateKey = null;
        if (config.getTemplate() != null) {
            templateId = config.getTemplate().getId();
            try {
                templateKey = config.getTemplate().getTemplateKey();
            } catch (Exception ignored) {}
        }
        return new ReminderConfigDto(
                config.getId(),
                config.getTriggerCode(),
                config.getDaysOffset(),
                templateId,
                templateKey,
                config.getIsActive()
        );
    }
}

