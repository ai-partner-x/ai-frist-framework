package com.aikoboot.orm.tenant;

import com.aikoboot.core.context.TenantContext;
import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.StringValue;

/**
 * 租户值取自 TenantContext（单租户阶段恒为 "default"，但拦截器真实运行、
 * 真实往每条 SQL 里加租户条件——见 spec"设计一"里的租户模型决策）。
 */
public class AikoTenantLineHandler implements TenantLineHandler {

    @Override
    public Expression getTenantId() {
        return new StringValue(TenantContext.getTenantId());
    }

    @Override
    public String getTenantIdColumn() {
        return "tenant_id";
    }

    @Override
    public boolean ignoreTable(String tableName) {
        return false;
    }
}
