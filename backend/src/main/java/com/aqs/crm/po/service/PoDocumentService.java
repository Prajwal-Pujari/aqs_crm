package com.aqs.crm.po.service;

import com.aqs.crm.common.exception.BadRequestException;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.config.MinioConfig;
import com.aqs.crm.contract.entity.ContractCycle;
import com.aqs.crm.contract.repository.ContractCycleRepository;
import com.aqs.crm.po.dto.PoDocumentDto;
import com.aqs.crm.po.entity.PoDocument;
import com.aqs.crm.po.repository.PoDocumentRepository;
import com.aqs.crm.user.entity.User;
import com.aqs.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PoDocumentService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "application/pdf"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final PoDocumentRepository poDocumentRepository;
    private final ContractCycleRepository contractCycleRepository;
    private final UserRepository userRepository;
    private final MinioStorageService minioStorageService;
    private final MinioConfig minioConfig;

    @Transactional(readOnly = true)
    public List<PoDocumentDto> getDocuments(Long cycleId) {
        if (!contractCycleRepository.existsById(cycleId)) {
            throw new ResourceNotFoundException("ContractCycle", "id", cycleId);
        }
        return poDocumentRepository.findByCycleId(cycleId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PoDocumentDto getDocument(Long cycleId, Long docId) {
        PoDocument doc = poDocumentRepository.findByIdAndCycleId(docId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PoDocument", "id", docId));
        return toDto(doc);
    }

    @Transactional
    public PoDocumentDto uploadDocument(Long cycleId, MultipartFile file, Long userId) {
        ContractCycle cycle = contractCycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("ContractCycle", "id", cycleId));

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10 MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPG, PNG, and PDF files are allowed");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String fileHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(file.getBytes());
            fileHash = HexFormat.of().formatHex(hashBytes);
        } catch (Exception ex) {
            log.error("Failed to calculate SHA-256 hash", ex);
            fileHash = null;
        }

        String cleanFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String minioKey = "po/" + cycleId + "/" + UUID.randomUUID() + "_" + cleanFilename;

        try (InputStream is = file.getInputStream()) {
            minioStorageService.uploadFile(minioKey, is, file.getSize(), contentType);
        } catch (Exception ex) {
            log.error("Failed to store file in MinIO", ex);
            throw new BadRequestException("Failed to upload file: " + ex.getMessage());
        }

        User uploader = null;
        if (userId != null) {
            uploader = userRepository.findById(userId).orElse(null);
        }

        PoDocument document = PoDocument.builder()
                .cycle(cycle)
                .fileName(cleanFilename)
                .contentType(contentType)
                .fileSize(file.getSize())
                .minioBucket(minioConfig.getBucket())
                .minioKey(minioKey)
                .fileHash(fileHash)
                .uploadedBy(uploader)
                .build();

        PoDocument saved = poDocumentRepository.save(document);
        log.info("Uploaded PO document id={} for cycle id={}", saved.getId(), cycleId);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public InputStream downloadDocumentStream(Long cycleId, Long docId) {
        PoDocument doc = poDocumentRepository.findByIdAndCycleId(docId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PoDocument", "id", docId));
        return minioStorageService.downloadFile(doc.getMinioKey());
    }

    @Transactional(readOnly = true)
    public String getDownloadUrl(Long cycleId, Long docId) {
        PoDocument doc = poDocumentRepository.findByIdAndCycleId(docId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PoDocument", "id", docId));
        return minioStorageService.getPresignedUrl(doc.getMinioKey(), 3600); // 1 hour
    }

    @Transactional
    public void deleteDocument(Long cycleId, Long docId) {
        PoDocument doc = poDocumentRepository.findByIdAndCycleId(docId, cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("PoDocument", "id", docId));

        minioStorageService.deleteFile(doc.getMinioKey());
        poDocumentRepository.delete(doc);
        log.info("Deleted PO document id={} for cycle id={}", docId, cycleId);
    }

    public PoDocumentDto toDto(PoDocument doc) {
        String downloadUrl = minioStorageService.getPresignedUrl(doc.getMinioKey(), 3600);
        String uploaderName = doc.getUploadedBy() != null ? doc.getUploadedBy().getFullName() : null;

        return new PoDocumentDto(
                doc.getId(),
                doc.getCycle().getId(),
                doc.getFileName(),
                doc.getContentType(),
                doc.getFileSize(),
                doc.getFileHash(),
                uploaderName,
                downloadUrl,
                doc.getCreatedAt()
        );
    }
}

