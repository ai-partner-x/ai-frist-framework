package com.aikoboot.core.exception;

/**
 * 各服务自定义业务错误码需要实现这个接口（core 不预置具体业务错误码）。
 */
public interface ErrorCode {

    int getCode();

    String getMessage();
}
