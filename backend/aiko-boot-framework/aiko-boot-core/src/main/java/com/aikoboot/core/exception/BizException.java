package com.aikoboot.core.exception;

/**
 * 业务异常。GlobalExceptionHandler（aiko-boot-starter-web，Task 2）捕获后转换为 Result.fail(code, message)。
 */
public class BizException extends RuntimeException {

    private final int code;

    public BizException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
