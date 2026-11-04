package com.aqs.crm.company.dto;

import com.aqs.crm.company.entity.PipelineStage;

public record CompanyUpdateRequest(
        String name,
        String industry,
        String website,
        String address,
        String city,
        String state,
        String country,
        String phone,
        String notes,
        PipelineStage pipelineStage,
        String servicesProvided,
        Long assignedTo
) {
}
