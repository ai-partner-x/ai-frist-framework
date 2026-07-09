package com.aikoboot.web.response;

import com.aikoboot.core.response.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class ResultWrapperAdviceTest {

    private final ResultWrapperAdvice advice = new ResultWrapperAdvice(new ObjectMapper());

    @SuppressWarnings("unused")
    private String stringReturningMethod() {
        return null;
    }

    @SuppressWarnings("unused")
    private Object objectReturningMethod() {
        return null;
    }

    private MethodParameter returnTypeOf(String methodName) throws NoSuchMethodException {
        Method method = ResultWrapperAdviceTest.class.getDeclaredMethod(methodName);
        return new MethodParameter(method, -1);
    }

    @Test
    void supports_alwaysReturnsTrue() {
        assertThat(advice.supports(null, null)).isTrue();
    }

    @Test
    void beforeBodyWrite_whenBodyAlreadyResult_passesThroughUnchanged() throws Exception {
        Result<String> original = Result.ok("hello");

        Object written = advice.beforeBodyWrite(original, returnTypeOf("objectReturningMethod"),
                null, null, null, null);

        assertThat(written).isSameAs(original);
    }

    @Test
    void beforeBodyWrite_whenBodyIsPlainObjectAndReturnTypeIsNotString_wrapsInResult() throws Exception {
        Object written = advice.beforeBodyWrite("plain value", returnTypeOf("objectReturningMethod"),
                null, null, null, null);

        assertThat(written).isInstanceOf(Result.class);
        assertThat(((Result<?>) written).getData()).isEqualTo("plain value");
        assertThat(((Result<?>) written).isSuccess()).isTrue();
    }

    @Test
    void beforeBodyWrite_whenReturnTypeIsString_manuallySerializesWrappedResultToJsonString() throws Exception {
        Object written = advice.beforeBodyWrite("plain value", returnTypeOf("stringReturningMethod"),
                null, null, null, null);

        assertThat(written).isInstanceOf(String.class);
        String json = (String) written;
        assertThat(json).contains("\"success\":true");
        assertThat(json).contains("\"data\":\"plain value\"");
    }
}
