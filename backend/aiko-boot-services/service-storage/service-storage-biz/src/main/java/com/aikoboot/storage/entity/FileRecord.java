package com.aikoboot.storage.entity;

import com.aikoboot.orm.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("file_record")
public class FileRecord extends BaseEntity {

    private String bucket;
    private String storageKey;
    private String originalFilename;
    private String contentType;
    private Long sizeBytes;

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
