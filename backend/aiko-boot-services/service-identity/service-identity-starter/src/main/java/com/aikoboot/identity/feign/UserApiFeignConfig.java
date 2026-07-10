package com.aikoboot.identity.feign;

import com.aikoboot.user.api.UserApi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 合并部署规约第 3 条（本地调用优先）的落地：只有当 UserApi 还没有别的 Bean
 * （即 service-user-biz 的 UserServiceImpl 不在 classpath 上，说明这是独立部署）
 * 时，才注册这个基于 Feign 的兜底实现。合并部署（platform-bootstrap）里
 * service-user-biz 的本地实现已经存在，这个 Bean 不会被创建。
 */
@Configuration
@EnableFeignClients(clients = UserFeignClient.class)
public class UserApiFeignConfig {

    @Bean
    @ConditionalOnMissingBean(UserApi.class)
    public UserApi userApi(UserFeignClient userFeignClient) {
        return new UserApiFeignAdapter(userFeignClient);
    }
}
