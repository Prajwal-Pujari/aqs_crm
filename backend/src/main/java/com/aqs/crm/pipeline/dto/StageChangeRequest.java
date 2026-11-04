package com.aqs.crm.pipeline.dto;

import com.aqs.crm.company.entity.PipelineStage;
import jakarta.validation.constraints.NotNull;

public record StageChangeRequest(
        @NotNull(message = "New stage is required")
        PipelineStage newStage,

        String notes
) {
}

