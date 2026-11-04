package com.aqs.crm.po.controller;

import com.aqs.crm.common.dto.ApiResponse;
import com.aqs.crm.po.dto.PoDocumentDto;
import com.aqs.crm.po.service.PoDocumentService;
import com.aqs.crm.security.CurrentUser;
import com.aqs.crm.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cycles/{cycleId}/documents")
@Tag(name = "PO Documents")
@RequiredArgsConstructor
public class PoDocumentController {

    private final PoDocumentService poDocumentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PoDocumentDto>>> getDocuments(@PathVariable Long cycleId) {
        List<PoDocumentDto> documents = poDocumentService.getDocuments(cycleId);
        return ResponseEntity.ok(ApiResponse.ok(documents));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PoDocumentDto>> uploadDocument(
            @PathVariable Long cycleId,
            @RequestParam("file") MultipartFile file,
            @CurrentUser UserPrincipal currentUser) {
        PoDocumentDto dto = poDocumentService.uploadDocument(cycleId, file, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("PO document uploaded successfully", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PoDocumentDto>> getDocument(
            @PathVariable Long cycleId,
            @PathVariable Long id) {
        PoDocumentDto dto = poDocumentService.getDocument(cycleId, id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long cycleId,
            @PathVariable Long id) {
        String presignedUrl = poDocumentService.getDownloadUrl(cycleId, id);
        if (presignedUrl != null) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(presignedUrl))
                    .build();
        }

        PoDocumentDto meta = poDocumentService.getDocument(cycleId, id);
        InputStream is = poDocumentService.downloadDocumentStream(cycleId, id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.fileName() + "\"")
                .body(new InputStreamResource(is));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long cycleId,
            @PathVariable Long id) {
        poDocumentService.deleteDocument(cycleId, id);
        return ResponseEntity.ok(ApiResponse.ok("PO document deleted successfully", null));
    }
}

