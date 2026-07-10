package com.aikoboot.orm.tenant;

import com.aikoboot.core.context.TenantContext;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.StringValue;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AikoTenantLineHandlerTest {

    private final AikoTenantLineHandler handler = new AikoTenantLineHandler();

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void getTenantId_wrapsCurrentTenantContextValueAsStringValue() {
        TenantContext.setTenantId("tenant-a");

        Expression expression = handler.getTenantId();

        assertThat(expression).isInstanceOf(StringValue.class);
        assertThat(((StringValue) expression).getValue()).isEqualTo("tenant-a");
    }

    @Test
    void getTenantId_whenTenantContextUnset_usesDefaultValue() {
        Expression expression = handler.getTenantId();

        assertThat(((StringValue) expression).getValue()).isEqualTo("default");
    }

    @Test
    void getTenantIdColumn_returnsTenantIdColumnName() {
        assertThat(handler.getTenantIdColumn()).isEqualTo("tenant_id");
    }

    @Test
    void ignoreTable_neverIgnoresAnyTable() {
        assertThat(handler.ignoreTable("any_table_name")).isFalse();
        assertThat(handler.ignoreTable("sys_user")).isFalse();
    }
}
