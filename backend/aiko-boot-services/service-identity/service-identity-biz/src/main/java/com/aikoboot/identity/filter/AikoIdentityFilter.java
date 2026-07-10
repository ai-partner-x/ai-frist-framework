package com.aikoboot.identity.filter;

import cn.dev33.satoken.stp.StpUtil;
import com.aikoboot.core.context.CurrentUserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 已登录请求把 Sa-Token 的登录 ID 接入 CurrentUserContext，供 BaseEntity 的
 * 审计字段自动填充使用。未登录请求不设置（CurrentUserContext 保持默认值 "system"）。
 */
public class AikoIdentityFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Object loginId = StpUtil.getLoginIdDefaultNull();
            if (loginId != null) {
                CurrentUserContext.setUserId(loginId.toString());
            }
            filterChain.doFilter(request, response);
        } finally {
            CurrentUserContext.clear();
        }
    }
}
