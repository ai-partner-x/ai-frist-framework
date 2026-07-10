CREATE TABLE file_record (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    bucket VARCHAR(64) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_file_record_key UNIQUE (bucket, storage_key)
);
