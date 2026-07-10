package com.aikoboot.message.config;

import cn.jiguang.sdk.api.PushApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PushApiConfig {

    @Bean
    public PushApi pushApi(@Value("${aiko.message.push.jpush.app-key}") String appKey,
                            @Value("${aiko.message.push.jpush.master-secret}") String masterSecret) {
        return new PushApi.Builder()
                .setAppKey(appKey)
                .setMasterSecret(masterSecret)
                .build();
    }
}
