CREATE TABLE msg_sms_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    template_code VARCHAR(64) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_template_id VARCHAR(64) NOT NULL,
    sign_name VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_sms_template UNIQUE (tenant_id, template_code, provider)
);

CREATE TABLE msg_log (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    target VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(500),
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0
);

CREATE TABLE msg_inbox (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    read_status INT NOT NULL DEFAULT 0,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0
);
