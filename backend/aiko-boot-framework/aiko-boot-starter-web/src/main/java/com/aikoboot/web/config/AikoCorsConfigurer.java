package com.aikoboot.web.config;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 默认跨域配置。allowedOriginPatterns（不是 allowedOrigins）是必须的写法——
 * allowCredentials(true) 时如果用 allowedOrigins("*") Spring 会直接抛异常。
 */
public class AikoCorsConfigurer implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    public AikoCorsConfigurer(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(corsProperties.getAllowedOrigins().toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
