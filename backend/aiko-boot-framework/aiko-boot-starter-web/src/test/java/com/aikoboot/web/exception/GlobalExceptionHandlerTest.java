package com.aikoboot.web.exception;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.core.response.Result;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleBizException_mapsCodeAndMessageFromException() {
        BizException ex = new BizException(404, "用户不存在");

        Result<Void> result = handler.handleBizException(ex);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(404);
        assertThat(result.getMessage()).isEqualTo("用户不存在");
    }

    @Test
    void handleValidationException_joinsAllFieldErrorMessages() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("obj", "username", "用户名不能为空"),
                new FieldError("obj", "email", "邮箱格式不正确")
        ));

        Result<Void> result = handler.handleValidationException(ex);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(400);
        assertThat(result.getMessage()).isEqualTo("用户名不能为空; 邮箱格式不正确");
    }

    @Test
    void handleConstraintViolationException_usesExceptionMessageDirectly() {
        ConstraintViolationException ex = new ConstraintViolationException("id: must not be null", null);

        Result<Void> result = handler.handleConstraintViolationException(ex);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(400);
        assertThat(result.getMessage()).isEqualTo("id: must not be null");
    }

    @Test
    void handleException_returnsGenericMessageWithoutLeakingExceptionDetails() {
        Exception ex = new RuntimeException("some internal secret detail that must not reach the client");

        Result<Void> result = handler.handleException(ex);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(500);
        assertThat(result.getMessage()).isEqualTo("服务器内部错误");
        assertThat(result.getMessage()).doesNotContain("secret detail");
    }
}
