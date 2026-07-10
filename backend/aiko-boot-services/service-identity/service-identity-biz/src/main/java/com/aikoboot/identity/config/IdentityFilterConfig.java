package com.aikoboot.identity.config;

import com.aikoboot.identity.filter.AikoIdentityFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IdentityFilterConfig {

    @Bean
    public FilterRegistrationBean<AikoIdentityFilter> aikoIdentityFilter() {
        FilterRegistrationBean<AikoIdentityFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new AikoIdentityFilter());
        registration.setOrder(Integer.MIN_VALUE + 1);
        return registration;
    }
}
