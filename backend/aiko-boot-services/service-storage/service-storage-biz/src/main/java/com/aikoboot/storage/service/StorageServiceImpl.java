package com.aikoboot.storage.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.storage.api.StorageApi;
import com.aikoboot.storage.api.dto.FileRecordDTO;
import com.aikoboot.storage.api.dto.PresignedUrlDTO;
import com.aikoboot.storage.config.StorageProperties;
import com.aikoboot.storage.entity.FileRecord;
import com.aikoboot.storage.exception.StorageErrorCode;
import com.aikoboot.storage.mapper.FileRecordMapper;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class StorageServiceImpl implements StorageApi {

    private static final DateTimeFormatter DATE_PATH_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final FileRecordMapper fileRecordMapper;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final StorageProperties storageProperties;

    public StorageServiceImpl(FileRecordMapper fileRecordMapper, S3Client s3Client, S3Presigner s3Presigner,
                               StorageProperties storageProperties) {
        this.fileRecordMapper = fileRecordMapper;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.storageProperties = storageProperties;
    }

    @Override
    public FileRecordDTO upload(MultipartFile file, String folder) {
        long id = IdWorker.getId();
        String storageKey = buildStorageKey(folder, id, file.getOriginalFilename());
        String bucket = storageProperties.getBucket();

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(storageKey)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }

        FileRecord record = new FileRecord();
        record.setId(id);
        record.setBucket(bucket);
        record.setStorageKey(storageKey);
        record.setOriginalFilename(file.getOriginalFilename());
        record.setContentType(file.getContentType());
        record.setSizeBytes(file.getSize());
        fileRecordMapper.insert(record);

        return toDto(record);
    }

    @Override
    public byte[] download(Long fileRecordId) {
        FileRecord record = requireRecord(fileRecordId);
        return s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(record.getBucket())
                        .key(record.getStorageKey())
                        .build()
        ).asByteArray();
    }

    @Override
    public PresignedUrlDTO getPresignedUrl(Long fileRecordId, int expirySeconds) {
        FileRecord record = requireRecord(fileRecordId);

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(expirySeconds))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(record.getBucket())
                        .key(record.getStorageKey())
                        .build())
                .build();
        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);

        PresignedUrlDTO dto = new PresignedUrlDTO();
        dto.setUrl(presigned.url().toString());
        dto.setExpiresAt(LocalDateTime.now().plusSeconds(expirySeconds));
        return dto;
    }

    @Override
    public void delete(Long fileRecordId) {
        FileRecord record = fileRecordMapper.selectById(fileRecordId);
        if (record == null) {
            // 已经不存在了，删除操作本身应当是幂等的，不需要报错
            return;
        }
        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(record.getBucket())
                        .key(record.getStorageKey())
                        .build());
        fileRecordMapper.deleteById(fileRecordId);
    }

    private FileRecord requireRecord(Long fileRecordId) {
        FileRecord record = fileRecordMapper.selectById(fileRecordId);
        if (record == null) {
            throw new BizException(StorageErrorCode.FILE_NOT_FOUND);
        }
        return record;
    }

    private String buildStorageKey(String folder, long id, String originalFilename) {
        String extension = extractExtension(originalFilename);
        String datePath = LocalDate.now().format(DATE_PATH_FORMAT);
        return folder + "/" + datePath + "/" + id + (extension.isEmpty() ? "" : "." + extension);
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 && dotIndex < originalFilename.length() - 1
                ? originalFilename.substring(dotIndex + 1)
                : "";
    }

    private FileRecordDTO toDto(FileRecord entity) {
        FileRecordDTO dto = new FileRecordDTO();
        dto.setId(entity.getId());
        dto.setStorageKey(entity.getStorageKey());
        dto.setOriginalFilename(entity.getOriginalFilename());
        dto.setContentType(entity.getContentType());
        dto.setSizeBytes(entity.getSizeBytes());
        return dto;
    }
}
