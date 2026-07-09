package com.aikoboot.core.context;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TenantContextTest {

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void getTenantId_whenNeverSet_returnsDefault() {
        assertThat(TenantContext.getTenantId()).isEqualTo("default");
    }

    @Test
    void getTenantId_afterSet_returnsTheSetValue() {
        TenantContext.setTenantId("tenant-a");

        assertThat(TenantContext.getTenantId()).isEqualTo("tenant-a");
    }

    @Test
    void clear_resetsToDefault() {
        TenantContext.setTenantId("tenant-a");

        TenantContext.clear();

        assertThat(TenantContext.getTenantId()).isEqualTo("default");
    }
}
