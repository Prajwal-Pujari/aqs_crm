package com.aqs.crm.po.dto;

import java.time.Instant;

public record PoDocumentDto(
        Long id,
        Long cycleId,
        String fileName,
        String contentType,
        Long fileSize,
        String fileHash,
        String uploadedByName,
        String downloadUrl,
        Instant createdAt
) {
}

