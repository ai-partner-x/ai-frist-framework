package com.aikoboot.orm.handler;

import com.aikoboot.core.context.CurrentUserContext;
import com.aikoboot.orm.entity.BaseEntity;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.reflection.SystemMetaObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AikoMetaObjectHandlerTest {

    private static class TestEntity extends BaseEntity {
    }

    private final AikoMetaObjectHandler handler = new AikoMetaObjectHandler();

    // MetaObjectHandler.strictInsertFill/strictUpdateFill look up the entity's TableInfo
    // (to check isWithInsertFill()/isWithUpdateFill()) via TableInfoHelper's static cache.
    // That cache is normally populated by MyBatis-Plus during mapper/XML parsing at
    // SqlSessionFactory startup. In a pure unit test there is no session, so we register
    // TestEntity's TableInfo once via MyBatis-Plus's own public
    // TableInfoHelper.initTableInfo(MapperBuilderAssistant, Class) -- the same call MyBatis-Plus
    // itself makes during mapper parsing, just invoked directly instead of through a full
    // Configuration/mapper-scan bootstrap.
    @BeforeAll
    static void registerTableInfo() {
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "test");
        TableInfoHelper.initTableInfo(assistant, TestEntity.class);
    }

    @AfterEach
    void cleanup() {
        CurrentUserContext.clear();
    }

    @Test
    void insertFill_setsAllFourAuditFieldsFromCurrentUserContext() {
        CurrentUserContext.setUserId("alice");
        TestEntity entity = new TestEntity();
        MetaObject metaObject = SystemMetaObject.forObject(entity);

        handler.insertFill(metaObject);

        assertThat(entity.getCreatedAt()).isNotNull();
        assertThat(entity.getCreatedBy()).isEqualTo("alice");
        assertThat(entity.getUpdatedAt()).isNotNull();
        assertThat(entity.getUpdatedBy()).isEqualTo("alice");
    }

    @Test
    void insertFill_whenCurrentUserContextUnset_fillsSystemAsDefaultOperator() {
        TestEntity entity = new TestEntity();
        MetaObject metaObject = SystemMetaObject.forObject(entity);

        handler.insertFill(metaObject);

        assertThat(entity.getCreatedBy()).isEqualTo("system");
        assertThat(entity.getUpdatedBy()).isEqualTo("system");
    }

    @Test
    void insertFill_doesNotTouchTenantId() {
        // tenantId is populated by TenantLineInnerInterceptor at the SQL layer, not by
        // MetaObjectHandler -- this test locks in that division of responsibility so a
        // future edit can't accidentally make MetaObjectHandler start filling it too.
        TestEntity entity = new TestEntity();
        MetaObject metaObject = SystemMetaObject.forObject(entity);

        handler.insertFill(metaObject);

        assertThat(entity.getTenantId()).isNull();
    }

    @Test
    void updateFill_setsUpdatedFieldsAndLeavesCreatedFieldsUntouched() {
        CurrentUserContext.setUserId("bob");
        TestEntity entity = new TestEntity();
        entity.setCreatedAt(LocalDateTime.of(2020, 1, 1, 0, 0));
        entity.setCreatedBy("original-creator");
        MetaObject metaObject = SystemMetaObject.forObject(entity);

        handler.updateFill(metaObject);

        assertThat(entity.getUpdatedAt()).isNotNull();
        assertThat(entity.getUpdatedBy()).isEqualTo("bob");
        assertThat(entity.getCreatedAt()).isEqualTo(LocalDateTime.of(2020, 1, 1, 0, 0));
        assertThat(entity.getCreatedBy()).isEqualTo("original-creator");
    }
}
