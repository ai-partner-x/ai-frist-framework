package com.aikoboot.user.exception;

import com.aikoboot.core.exception.ErrorCode;

public enum UserErrorCode implements ErrorCode {

    USER_NOT_FOUND(404, "用户不存在");

    private final int code;
    private final String message;

    UserErrorCode(int code, String message) {
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
