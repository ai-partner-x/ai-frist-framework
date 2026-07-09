package com.aikoboot.web.autoconfigure;

import com.aikoboot.web.config.AikoCorsConfigurer;
import com.aikoboot.web.config.CorsProperties;
import com.aikoboot.web.exception.GlobalExceptionHandler;
import com.aikoboot.web.filter.TenantContextFilter;
import com.aikoboot.web.response.ResultWrapperAdvice;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@EnableConfigurationProperties(CorsProperties.class)
public class AikoWebAutoConfiguration {

    @Bean
    public GlobalExceptionHandler globalExceptionHandler() {
        return new GlobalExceptionHandler();
    }

    @Bean
    public ResultWrapperAdvice resultWrapperAdvice(ObjectMapper objectMapper) {
        return new ResultWrapperAdvice(objectMapper);
    }

    @Bean
    public FilterRegistrationBean<TenantContextFilter> tenantContextFilter() {
        FilterRegistrationBean<TenantContextFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new TenantContextFilter());
        registration.setOrder(Integer.MIN_VALUE);
        return registration;
    }

    @Bean
    public AikoCorsConfigurer aikoCorsConfigurer(CorsProperties corsProperties) {
        return new AikoCorsConfigurer(corsProperties);
    }
}
