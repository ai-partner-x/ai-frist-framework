package com.aikoboot.core.tenant;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * aiko.tenant.enabled — 本轮该开关不影响任何运行时行为（租户拦截器一直运行，
 * TenantContext 恒定返回 "default"），只作为未来真正切换多租户时的预留配置点。
 */
@ConfigurationProperties(prefix = "aiko.tenant")
public class TenantProperties {

    private boolean enabled = false;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
