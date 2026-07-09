package com.aikoboot.core.context;

/**
 * 当前请求的租户上下文（ThreadLocal）。
 *
 * 现阶段只有一个产品线，getTenantId() 在未显式设置时返回固定值 "default"——
 * 这不是"关闭"，是真实的租户拦截器（aiko-boot-starter-orm，Task 3）一直在运行，
 * 只是租户值恒定。未来接入真多租户时，只需要在请求入口处调用 setTenantId(真实值)，
 * ORM 层不需要任何改动。
 */
public final class TenantContext {

    private static final ThreadLocal<String> HOLDER = new ThreadLocal<>();
    private static final String DEFAULT_TENANT_ID = "default";

    private TenantContext() {
    }

    public static void setTenantId(String tenantId) {
        HOLDER.set(tenantId);
    }

    public static String getTenantId() {
        String tenantId = HOLDER.get();
        return tenantId != null ? tenantId : DEFAULT_TENANT_ID;
    }

    public static void clear() {
        HOLDER.remove();
    }
}
