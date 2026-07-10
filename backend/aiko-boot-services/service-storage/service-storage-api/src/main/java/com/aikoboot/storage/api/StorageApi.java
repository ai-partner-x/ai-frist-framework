package com.aikoboot.storage.api;

import com.aikoboot.storage.api.dto.FileRecordDTO;
import com.aikoboot.storage.api.dto.PresignedUrlDTO;
import org.springframework.web.multipart.MultipartFile;

public interface StorageApi {

    FileRecordDTO upload(MultipartFile file, String folder);

    byte[] download(Long fileRecordId);

    PresignedUrlDTO getPresignedUrl(Long fileRecordId, int expirySeconds);

    void delete(Long fileRecordId);
}
