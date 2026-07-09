package com.aikoboot.core.autoconfigure;

import com.aikoboot.core.jackson.AikoJacksonCustomizer;
import com.aikoboot.core.jackson.LongToStringModule;
import com.aikoboot.core.tenant.TenantProperties;
import com.fasterxml.jackson.databind.Module;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * aiko-boot-core 的 Spring Boot 自动配置入口。依赖本模块的服务（web/orm/service-user 等）
 * 引入依赖后自动获得 Result/BizException 之外的这些 Bean，无需手动 @Import。
 */
@AutoConfiguration
@EnableConfigurationProperties(TenantProperties.class)
public class AikoCoreAutoConfiguration {

    @Bean
    public Module longToStringModule() {
        return new LongToStringModule();
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer aikoJacksonCustomizer() {
        return new AikoJacksonCustomizer();
    }
}
