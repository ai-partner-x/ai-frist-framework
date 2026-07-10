package com.aikoboot.identity.exception;

import com.aikoboot.core.exception.ErrorCode;

public enum IdentityErrorCode implements ErrorCode {

    INVALID_CREDENTIALS(401, "用户名或密码错误"),
    ACCOUNT_LOCKED(423, "账号已被锁定，请稍后再试");

    private final int code;
    private final String message;

    IdentityErrorCode(int code, String message) {
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
