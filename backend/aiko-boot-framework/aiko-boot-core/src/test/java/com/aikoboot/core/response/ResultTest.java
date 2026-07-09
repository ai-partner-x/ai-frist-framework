package com.aikoboot.core.response;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ResultTest {

    @Test
    void ok_withoutData_hasSuccessTrueCodeZeroAndNullData() {
        Result<String> result = Result.ok();

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getCode()).isZero();
        assertThat(result.getMessage()).isEqualTo("OK");
        assertThat(result.getData()).isNull();
    }

    @Test
    void ok_withData_wrapsTheGivenData() {
        Result<String> result = Result.ok("hello");

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEqualTo("hello");
    }

    @Test
    void fail_setsSuccessFalseAndGivenCodeAndMessage() {
        Result<String> result = Result.fail(400, "bad request");

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(400);
        assertThat(result.getMessage()).isEqualTo("bad request");
        assertThat(result.getData()).isNull();
    }
}
