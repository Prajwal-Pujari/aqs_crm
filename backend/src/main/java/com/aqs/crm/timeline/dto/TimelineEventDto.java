package com.aqs.crm.timeline.dto;

import java.time.Instant;
import java.util.Map;

public record TimelineEventDto(
        String id,
        String eventType,
        String title,
        String description,
        String category,
        String badge,
        String authorName,
        Instant timestamp,
        Map<String, Object> metadata
) {
}

