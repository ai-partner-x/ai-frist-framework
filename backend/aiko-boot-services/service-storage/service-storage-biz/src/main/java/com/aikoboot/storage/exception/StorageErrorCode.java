package com.aikoboot.storage.exception;

import com.aikoboot.core.exception.ErrorCode;

public enum StorageErrorCode implements ErrorCode {

    FILE_NOT_FOUND(404, "文件不存在");

    private final int code;
    private final String message;

    StorageErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
