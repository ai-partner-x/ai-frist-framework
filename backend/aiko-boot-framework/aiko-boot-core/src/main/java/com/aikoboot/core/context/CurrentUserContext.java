package com.aikoboot.core.context;

/**
 * 当前操作人上下文（ThreadLocal）。在 service-identity 的登录鉴权实现之前，
 * getUserId() 未显式设置时返回固定值 "system"。BaseEntity 的 createdBy/updatedBy
 * 审计字段（aiko-boot-starter-orm，Task 3）从这里读取。
 */
public final class CurrentUserContext {

    private static final ThreadLocal<String> HOLDER = new ThreadLocal<>();
    private static final String DEFAULT_USER_ID = "system";

    private CurrentUserContext() {
    }

    public static void setUserId(String userId) {
        HOLDER.set(userId);
    }

    public static String getUserId() {
        String userId = HOLDER.get();
        return userId != null ? userId : DEFAULT_USER_ID;
    }

    public static void clear() {
        HOLDER.remove();
    }
}
