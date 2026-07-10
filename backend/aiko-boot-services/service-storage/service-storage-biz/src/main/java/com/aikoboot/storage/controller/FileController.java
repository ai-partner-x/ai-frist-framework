package com.aikoboot.storage.controller;

import com.aikoboot.storage.api.StorageApi;
import com.aikoboot.storage.api.dto.FileRecordDTO;
import com.aikoboot.storage.api.dto.PresignedUrlDTO;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final StorageApi storageApi;

    public FileController(StorageApi storageApi) {
        this.storageApi = storageApi;
    }

    @PostMapping
    public FileRecordDTO upload(@RequestParam("file") MultipartFile file,
                                 @RequestParam("folder") String folder) {
        return storageApi.upload(file, folder);
    }

    @GetMapping("/{id}/url")
    public PresignedUrlDTO getPresignedUrl(@PathVariable Long id,
                                            @RequestParam(defaultValue = "3600") int expirySeconds) {
        return storageApi.getPresignedUrl(id, expirySeconds);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        storageApi.delete(id);
    }
}
