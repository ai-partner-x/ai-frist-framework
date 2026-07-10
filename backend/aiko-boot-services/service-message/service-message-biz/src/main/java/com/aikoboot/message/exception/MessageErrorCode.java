package com.aikoboot.message.exception;

import com.aikoboot.core.exception.ErrorCode;

public enum MessageErrorCode implements ErrorCode {

    NOT_LOGIN(401, "未登录");

    private final int code;
    private final String message;

    MessageErrorCode(int code, String message) {
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
