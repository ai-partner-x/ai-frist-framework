package com.aikoboot.web.response;

import com.aikoboot.core.response.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * 把 controller 裸返回值自动包装成 Result.ok(data)；如果已经是 Result，原样透传。
 *
 * String 类型返回值特殊处理：Spring 用 StringHttpMessageConverter 直接写 String，
 * 如果这里返回一个 Result 对象，写入阶段会抛 ClassCastException（经典坑）。
 * 所以 String 类型的返回值手动序列化成 JSON 字符串再返回。
 */
@RestControllerAdvice
public class ResultWrapperAdvice implements ResponseBodyAdvice<Object> {

    private final ObjectMapper objectMapper;

    public ResultWrapperAdvice(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                   Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                   ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof Result) {
            return body;
        }
        Result<Object> wrapped = Result.ok(body);
        if (returnType.getParameterType() == String.class) {
            try {
                return objectMapper.writeValueAsString(wrapped);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Failed to wrap String response body", e);
            }
        }
        return wrapped;
    }
}
