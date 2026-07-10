package com.aikoboot.identity.filter;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.core.context.CurrentUserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 已登录请求把 Sa-Token 的登录 ID 接入 CurrentUserContext，供 BaseEntity 的
 * 审计字段自动填充使用。未登录请求不设置（CurrentUserContext 保持默认值 "system"）。
 *
 * 用 HandlerInterceptor 而不是 Servlet Filter：Sa-Token 自己的上下文初始化
 * 也是通过一个 Filter（SaTokenContextFilterForJakartaServlet）完成的，它没有
 * 显式排序，默认排在 Ordered.LOWEST_PRECEDENCE（filter 链里几乎最后）。如果
 * 这里也用 Filter 并且顺序比它靠前，StpUtil 调用会在 Sa-Token 上下文初始化之前
 * 执行，直接抛 SaTokenContextException。HandlerInterceptor 由 DispatcherServlet
 * 在所有 Filter 都跑完之后才执行，天然保证在 Sa-Token 的 Filter 之后，不依赖任何
 * 顺序数值假设。
 */
public class AikoIdentityInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Object loginId = StpUtil.getLoginIdDefaultNull();
        if (loginId != null) {
            CurrentUserContext.setUserId(loginId.toString());
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        CurrentUserContext.clear();
    }
}
