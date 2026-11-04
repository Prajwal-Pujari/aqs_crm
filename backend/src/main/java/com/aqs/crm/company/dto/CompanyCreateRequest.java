package com.aqs.crm.company.dto;

import com.aqs.crm.company.entity.PipelineStage;
import jakarta.validation.constraints.NotBlank;

public record CompanyCreateRequest(
        @NotBlank(message = "Company name is required")
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
    public CompanyCreateRequest {
        if (pipelineStage == null) {
            pipelineStage = PipelineStage.LEAD;
        }
    }
}
