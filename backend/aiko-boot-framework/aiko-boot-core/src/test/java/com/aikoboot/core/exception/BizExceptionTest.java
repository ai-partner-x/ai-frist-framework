package com.aikoboot.core.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BizExceptionTest {

    private enum SampleErrorCode implements ErrorCode {
        SAMPLE_ERROR(1001, "sample error message");

        private final int code;
        private final String message;

        SampleErrorCode(int code, String message) {
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

    @Test
    void constructFromErrorCode_copiesCodeAndMessage() {
        BizException ex = new BizException(SampleErrorCode.SAMPLE_ERROR);

        assertThat(ex.getCode()).isEqualTo(1001);
        assertThat(ex.getMessage()).isEqualTo("sample error message");
    }

    @Test
    void constructFromCodeAndMessage_setsBothDirectly() {
        BizException ex = new BizException(500, "boom");

        assertThat(ex.getCode()).isEqualTo(500);
        assertThat(ex.getMessage()).isEqualTo("boom");
    }
}
