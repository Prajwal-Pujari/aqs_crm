package com.aqs.crm.po.service;

import com.aqs.crm.config.MinioConfig;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class MinioStorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @PostConstruct
    public void ensureBucketExists() {
        try {
            String bucket = minioConfig.getBucket();
            if (bucket != null && !bucket.isBlank()) {
                boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
                if (!exists) {
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                    log.info("Created MinIO bucket: {}", bucket);
                }
            }
        } catch (Exception ex) {
            log.warn("MinIO bucket check failed on startup (MinIO may not be running yet): {}", ex.getMessage());
        }
    }

    public String uploadFile(String key, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(key)
                            .stream(stream, size, -1)
                            .contentType(contentType)
                            .build()
            );
            log.info("File uploaded to MinIO: key={}, size={}", key, size);
            return key;
        } catch (Exception ex) {
            log.error("Failed to upload file to MinIO: key={}", key, ex);
            throw new RuntimeException("Failed to upload document to storage: " + ex.getMessage(), ex);
        }
    }

    public InputStream downloadFile(String key) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(key)
                            .build()
            );
        } catch (Exception ex) {
            log.error("Failed to download file from MinIO: key={}", key, ex);
            throw new RuntimeException("Failed to download document from storage: " + ex.getMessage(), ex);
        }
    }

    public void deleteFile(String key) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(key)
                            .build()
            );
            log.info("File deleted from MinIO: key={}", key);
        } catch (Exception ex) {
            log.error("Failed to delete file from MinIO: key={}", key, ex);
            throw new RuntimeException("Failed to delete document from storage: " + ex.getMessage(), ex);
        }
    }

    public String getPresignedUrl(String key, int expirySeconds) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioConfig.getBucket())
                            .object(key)
                            .expiry(expirySeconds, TimeUnit.SECONDS)
                            .build()
            );
        } catch (Exception ex) {
            log.error("Failed to generate presigned URL for key={}", key, ex);
            return null;
        }
    }
}

