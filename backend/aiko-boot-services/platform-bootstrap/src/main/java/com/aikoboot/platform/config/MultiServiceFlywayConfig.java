package com.aikoboot.platform.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * 合并部署下，Spring Boot 默认的单一 FlywayAutoConfiguration 只能配一个
 * location + 一个历史表。多个服务的迁移脚本各自从 V1 开始编号，如果都丢给
 * 默认的 classpath:db/migration 递归扫描合并成一次 Flyway 运行，会因为
 * "两个 V1" 报 FlywayException: Found more than one migration with version 1
 * （这是本任务第一次真正合并 2 个服务时才暴露的真实 bug，不是假设）。
 *
 * 固定为每个服务单独跑一次 Flyway（各自的 location + 各自的历史表名，和
 * 各服务自己独立部署时的 application.yml 配置保持一致），全部指向同一个
 * DataSource。application.yml 里 spring.flyway.enabled=false 关闭了自动配置，
 * 这个类接管实际的迁移执行。
 *
 * 新服务加入 platform-bootstrap 且带有自己的 db/migration/&lt;service&gt; 目录时，
 * 需要把服务名加进下面的数组。
 */
@Configuration
public class MultiServiceFlywayConfig implements InitializingBean {

    private static final String[] SERVICES_WITH_MIGRATIONS = {"user", "identity"};

    private final DataSource dataSource;

    public MultiServiceFlywayConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void afterPropertiesSet() {
        for (String service : SERVICES_WITH_MIGRATIONS) {
            Flyway.configure()
                    .dataSource(dataSource)
                    .locations("classpath:db/migration/" + service)
                    .table("flyway_schema_history_" + service)
                    // 多个服务共用同一个物理 schema，每个服务用自己独立的历史表——
                    // 第二个及之后的服务跑迁移时，schema 里已经有其它服务建的表，但
                    // 还没有"这个服务自己的"历史表，Flyway 默认会因为
                    // "非空 schema 但没有历史表" 报错拒绝执行，需要显式告知这是预期情况。
                    .baselineOnMigrate(true)
                    // baselineVersion 默认是 "1"——正好和每个服务自己的第一个迁移脚本
                    // V1__... 撞号，会导致 Flyway 认为"当前已经是 1 版本"，把 V1 脚本当成
                    // "已经跑过"直接跳过（这是真实踩到的坑：identity 的 V1 脚本被跳过，
                    // sys_user_credential 等表根本没建出来，直到真的调用相关接口才暴露）。
                    // 显式设成 "0"，让每个服务自己的 V1 迁移在 baseline 之上被当成新迁移正常执行。
                    .baselineVersion("0")
                    .load()
                    .migrate();
        }
    }
}
