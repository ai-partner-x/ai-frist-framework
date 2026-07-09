package com.aikoboot.web.filter;

import com.aikoboot.core.context.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 单租户阶段：请求开始时把 TenantContext 设为 "default"，结束时清理，
 * 避免线程池复用导致的租户串号（ThreadLocal 常见坑）。
 */
public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            TenantContext.setTenantId("default");
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
