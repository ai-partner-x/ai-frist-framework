package com.aikoboot.orm.autoconfigure;

import com.aikoboot.orm.handler.AikoMetaObjectHandler;
import com.aikoboot.orm.tenant.AikoTenantLineHandler;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class AikoOrmAutoConfiguration {

    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new AikoMetaObjectHandler();
    }

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 注册顺序是硬约束：租户插件必须在分页插件之前，顺序反了会导致租户条件失效
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new AikoTenantLineHandler()));
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
