package com.aqs.crm.company.dto;

import java.time.Instant;

public record CompanyDto(
        Long id,
        String name,
        String industry,
        String website,
        String address,
        String city,
        String state,
        String country,
        String phone,
        String notes,
        String pipelineStage,
        String servicesProvided,
        Long assignedToId,
        String assignedToName,
        Instant createdAt,
        Instant updatedAt
) {
}
