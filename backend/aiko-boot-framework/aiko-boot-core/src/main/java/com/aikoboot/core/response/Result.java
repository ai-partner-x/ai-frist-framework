package com.aikoboot.core.response;

/**
 * 统一响应体。合并部署/独立部署下所有服务的 REST 响应都用这个包装。
 */
public class Result<T> {

    private boolean success;
    private int code;
    private String message;
    private T data;

    protected Result() {
    }

    public static <T> Result<T> ok() {
        return ok(null);
    }

    public static <T> Result<T> ok(T data) {
        Result<T> result = new Result<>();
        result.success = true;
        result.code = 0;
        result.message = "OK";
        result.data = data;
        return result;
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.success = false;
        result.code = code;
        result.message = message;
        result.data = null;
        return result;
    }

    public boolean isSuccess() {
        return success;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}
