# Java 后端第一批具体实现：框架层落地 + service-user 垂直切片 设计

- 日期：2026-07-09
- 状态：已批准（设计阶段），待写实施计划
- 前置 spec：[2026-07-09-repo-layout-and-java-backend-skeleton-design.md](2026-07-09-repo-layout-and-java-backend-skeleton-design.md)（已实施，`backend/` 骨架已合并到 main）

## 背景

前置 spec 落地了 `backend/` 下的 Maven 多模块骨架（`aiko-boot-framework` 4 个空模块、`aiko-boot-services` 下 4 个服务的 api/biz/starter 空模块），并留下一份"必答清单"作为本次设计的输入。本 spec 回答该清单，并给出第一批可编译运行的具体实现范围。

## 目标

- 回答必答清单的全部 7 项，形成可执行的技术决策。
- 把 `aiko-boot-core` / `aiko-boot-starter-web` / `aiko-boot-starter-orm` 三个框架模块从空壳变成有真实基础设施代码的模块。
- 交付 `service-user` 一条完整的垂直切片（真实体、真表、真 CRUD API），作为其余服务后续实现时抄的模板。
- 调整 `aiko-boot-services` 的模块树，使其匹配"身份域合并 + 新增存储服务"的决策。

## 非目标（本次不做）

- `service-identity`（合并自 `service-auth` + `service-permission`）、`service-message`、`service-storage` 的业务逻辑——本次只调整骨架（改名/改包/新增/端口重分配），具体实现留给各自的下一轮 spec。
- 真正的多租户运行时隔离——租户拦截器机制本轮就位，但 `TenantContext` 在返回真实租户值之前，只返回固定值。
- 幂等性 token、API 版本控制、敏感字段脱敏、分布式链路追踪——按 YAGNI 原则明确推迟，等真实业务场景出现再设计。

## 必答清单逐项决策

| # | 问题 | 决策 |
|---|---|---|
| 1 | Spring Cloud 技术栈 | **Spring Cloud Alibaba**（Nacos 注册/配置中心 + Sentinel 限流熔断 + Seata 分布式事务）。版本组合：Spring Boot `3.5.0` + Spring Cloud `2025.0.0` + Spring Cloud Alibaba `2025.0.0.0`，JDK 17+（三者均为已发布的兼容版本，非推测）|
| 2 | 多租户数据模型 | 现阶段只有一个产品线，**不启用真正的运行时隔离**，但 `tenant_id` 列 + `TenantLineInnerInterceptor` 从第一天起就真实注册运行（见下）——不是"建了列但不用"，而是"拦截器一直在跑，只是租户值永远是 `default`" |
| 3 | 合并部署规约 | 三条具体机制：配置命名空间前缀 `aiko.services.<name>.*`；每个 `*-biz` 独立的 Flyway 迁移路径 + 独立 `flyway_schema_history_<service>` 表；`*-api` 接口 + `*-biz` 本地 `@Service` 实现 + `*-starter` 里 `@ConditionalOnMissingBean` 的 Feign 兜底实现，实现"合并部署本地调用、独立部署远程调用"零代码判断 |
| 4 | 身份域粒度 | **合并 `service-auth` + `service-permission` 为 `service-identity`**，避免鉴权+权限每请求多一跳网络调用。认证/授权框架选型见下 |
| 5 | 框架层克制原则 | 已在骨架阶段执行（6 个候选 starter 砍到 4 个：core/web/orm/cloud）。本次新增的每一项基础设施（见下）都标注了"比官方多什么" |
| 6 | 数据扩展机制 | 产品线在自己的库里建扩展表（如 `biz_user_ext`），通过平台实体的 ID 关联，平台表结构不因产品定制而变化 |
| 7 | 通用服务清单 | 本批新增 **`service-storage`**（文件存储）；审计日志、数据字典、定时任务、网关限流等明确推迟，等真实需求出现 |

**身份域框架选型（用户确认）**：`service-identity` 使用 **Sa-Token**（`cn.dev33:sa-token-spring-boot3-starter:1.44.0`，Spring Boot 3.x/JDK 17 版本线）而非 Spring Security。理由：Sa-Token 的登录鉴权/权限校验/分布式 Session（`sa-token-dao-redis`）/Spring Cloud Gateway 集成开箱即用，代码量远小于自己在 Spring Security 之上搭 RBAC；本框架的设计语言（Spring Boot 风格、MyBatis-Plus 风格、中台、RBAC）本就对标国内企业级中台生态，与 Sa-Token 的主流定位一致。**本次不添加该依赖**（`service-identity-biz` 本轮仍是空骨架，没有代码消费它），只在此记录决策，供下一轮 `service-identity` 详细设计直接使用，不再重新讨论框架选型。

## 设计一：aiko-boot-core

- **统一响应**：`Result<T>`（`success`/`code`/`message`/`data`），静态工厂 `Result.ok(data)` / `Result.fail(code, message)`
- **异常体系**：`BizException`（非受检，带 `code`+`message`）；`ErrorCode` 接口（各服务自定义枚举实现，不在 core 里预置业务错误码）
- **租户上下文**：`TenantContext`（`ThreadLocal`）+ `TenantProperties`（`aiko.tenant.enabled`，默认 `false`，本轮该开关暂不影响运行时行为，只作为未来切换点保留）。当前实现：`TenantContext.getTenantId()` 永远返回常量 `"default"`
- **操作人上下文**：`CurrentUserContext`（`ThreadLocal`，结构与 `TenantContext` 一致）。取不到时返回 `"system"`。待 `service-identity` 的登录鉴权实现后，直接对接真实登录态，`aiko-boot-core`/`aiko-boot-starter-orm` 不需要改动
- **雪花 ID 序列化**：全局 Jackson 模块，把所有 `Long`/`long` 序列化为字符串（`ToStringSerializer`），解决前端 JS 处理超过 2^53 的雪花 ID 时的精度丢失问题。这个决策必须现在定，一旦有真实前端消费者依赖了错误的数字格式，后续是破坏性变更
- **统一时区**：`ObjectMapper` 配置 `Asia/Shanghai` + `LocalDateTime` 统一格式 `yyyy-MM-dd HH:mm:ss`
- **合并部署规约**（core 的核心职责，非文档层面的口头约定，而是具体机制）：
  1. 配置命名空间：`aiko.services.<name>.*` 前缀约定，写入代码模板注释（无法在代码层面强制校验）
  2. 独立迁移历史：每个 `*-biz` 的 Flyway 脚本位于自己的 `db/migration/<service>/` 子路径，`spring.flyway.table=flyway_schema_history_<service>`
  3. 本地调用优先：`*-api` 定义接口 → `*-biz` 提供本地 `@Service` 实现 → `*-starter` 里的 Feign 客户端配置类标注 `@ConditionalOnMissingBean(<Service>Api.class)`，合并部署时本地实现自动优先

## 设计二：aiko-boot-starter-web

- `GlobalExceptionHandler`（`@RestControllerAdvice`）：`BizException` → `Result.fail`；`MethodArgumentNotValidException`（`@RequestBody` 校验失败）和 `ConstraintViolationException`（参数校验失败）→ `Result.fail(400, 字段错误信息)`；兜底捕获其余异常 → 500，不透出堆栈
- `ResponseBodyAdvice`：controller 返回裸对象自动包装为 `Result.ok(data)`；已经是 `Result` 类型则原样透传
- `TenantContextFilter`（`OncePerRequestFilter`）：请求开始时设置 `TenantContext` 为 `"default"`，请求结束 `TenantContext.clear()`（避免线程池复用导致租户串号）
- **Validation**：引入 `spring-boot-starter-validation`；DTO 用标准 JSR-380 注解（`@NotBlank`/`@Email`/`@Size`），controller 方法参数标 `@Valid`
- **API 文档**：`springdoc-openapi-starter-webmvc-ui:2.8.17`，自动生成 OpenAPI 3 文档 + Swagger UI
- **CORS**：默认跨域配置类，允许域名列表可配置
- **Actuator**：`spring-boot-starter-actuator`，暴露 `/actuator/health`，供 Nacos 注册中心做健康检查

## 设计三：aiko-boot-starter-orm

- `BaseEntity`：`id`（`@TableId(type = ASSIGN_ID)`，雪花算法，非自增，适配分布式/多租户场景）、`tenantId`（`@TableField(fill = INSERT)`）、`createdAt`/`createdBy`/`updatedAt`/`updatedBy`（四个审计字段，均 `@TableField(fill = ...)` 自动填充）、`deleted`（`@TableLogic`，逻辑删除）
- `MetaObjectHandler` 实现类：自动填充 `createdAt`/`createdBy`（插入时）、`updatedAt`/`updatedBy`（插入+更新时），`createdBy`/`updatedBy` 从 `CurrentUserContext` 读取
- `MybatisPlusInterceptor` 配置类：**注册顺序是硬约束**——`TenantLineInnerInterceptor` 必须在 `PaginationInnerInterceptor` **之前**注册，顺序错了会导致租户条件失效（MyBatis-Plus 已知坑，写入代码注释防止后人踩坑）
- `TenantLineHandler` 实现：`getTenantId()` 读 `TenantContext.getTenantId()`；`getTenantIdColumn()` 返回 `"tenant_id"`；`ignoreTable()` 支持按表名排除（预留给未来的全局共享表）

## 设计四：service-user 垂直切片（本批唯一完整实现的服务）

- **`service-user-api`**：`UserApi` 接口（`getById`/`create`/`update`/`delete`/`list` 等签名）+ DTO（`UserDTO`、`CreateUserRequest` 带校验注解、`UpdateUserRequest`）
- **`service-user-biz`**：
  - `User extends BaseEntity`（`username`、`email`、`phone`、`status`）
  - `UserMapper extends BaseMapper<User>`
  - `UserServiceImpl implements UserApi`（`@Service`，本地实现）
  - Flyway 迁移脚本：`db/migration/user/V1__create_sys_user.sql`，建 `sys_user` 表（含 `tenant_id`、四个审计字段、逻辑删除列）
- **`service-user-starter`**：
  - `UserController`：薄层，直接委托 `UserApi`，暴露 `/api/users` 系列 REST 端点
  - 端口 9101（不变）
  - **本轮不构建 Feign 兜底客户端**：合并部署规约第 3 条（本地调用优先）需要一个真实的跨服务调用方才能验证，本批次里 `service-identity`/`service-message`/`service-storage` 仍是空骨架，没有代码需要跨服务调用 `UserApi`。现在搭 Feign 客户端是建一个没有消费者、无法验证的组件，违反 YAGNI。留到 `service-identity` 详细设计时（它大概率需要按用户名查用户）再补——那时候有真实调用方，才能真正验证"合并部署走本地、独立部署走 Feign"这条规约是否生效
- **数据库**：本地开发用 H2 内存库（零配置），生产用 MySQL（`mysql-connector-j`），延续 TS 侧 `aiko-boot-codegen` 生成的 Java 项目已有的约定

## 设计五：aiko-boot-services 模块树调整

```
aiko-boot-services/
├── service-user/                  # 不变，本批唯一完整实现
│   ├── service-user-api/
│   ├── service-user-biz/
│   └── service-user-starter/          # port 9101
├── service-identity/               # 替代 service-auth + service-permission，本批仅骨架
│   ├── service-identity-api/
│   ├── service-identity-biz/
│   └── service-identity-starter/      # port 9102
├── service-message/                # 不变，本批仅骨架
│   ├── service-message-api/
│   ├── service-message-biz/
│   └── service-message-starter/       # port 9103（原 9104，前移一位）
├── service-storage/                 # 新增，本批仅骨架
│   ├── service-storage-api/
│   ├── service-storage-biz/
│   └── service-storage-starter/       # port 9104（新分配）
└── platform-bootstrap/              # 依赖调整为 user-biz + identity-biz + message-biz + storage-biz，port 9100 不变
```

**迁移动作**：
1. `git mv service-auth service-identity`，内部三个子模块 artifactId/Java 包/类名同步改名（`com.aikoboot.auth` → `com.aikoboot.identity`，`AuthServiceApplication` → `IdentityServiceApplication`）
2. 删除 `service-permission` 整个目录（其骨架内容已被 `service-identity` 覆盖，不做业务逻辑合并，因为两边目前都是空骨架）
3. `service-message` 端口从 9104 改为 9103
4. 新增 `service-storage` 完整四件套（api/biz/starter + 占位 Application 类），仿照现有骨架模式（同 `service-user` 当初创建时的结构）
5. `platform-bootstrap` 的 Maven 依赖列表和 `scanBasePackages` 同步更新

## 验收标准

- [ ] `mvn -f backend/pom.xml package -DskipTests` 全量构建成功
- [ ] `aiko-boot-core`/`aiko-boot-starter-web`/`aiko-boot-starter-orm` 三个模块包含本 spec 列出的全部基础设施类，非空壳
- [ ] `service-user-starter` 可独立启动，`POST /api/users`、`GET /api/users/{id}` 等端点针对 H2 真实可用，返回 `Result` 包装的响应
- [ ] 新建用户后，`tenant_id`/`created_at`/`created_by` 等审计字段被自动正确填充（验证 `MetaObjectHandler` + 租户拦截器真实生效）
- [ ] Swagger UI（`/swagger-ui.html` 或 springdoc 默认路径）可访问，展示 `service-user` 的 API 文档
- [ ] `service-identity`（含改名/删除 `service-permission`）、`service-message`（端口调整）、`service-storage`（新增骨架）的模块树调整完成，`mvn validate` 通过
- [ ] `platform-bootstrap` 依赖 4 个 `*-biz` 模块，`mvn package` 通过

## 后续（不在本次范围内）

- `service-identity` 详细设计：基于 Sa-Token 的登录鉴权、RBAC（角色-菜单-数据权限）表结构与 API——另开一次 brainstorming spec，直接复用本 spec 已确定的框架选型，不再讨论 Sa-Token vs Spring Security。
- `service-message` 详细设计：短信/邮件/其他通道的抽象与实现。
- `service-storage` 详细设计：本地/S3/OSS/COS 等存储提供商适配（TS 侧 `aiko-boot-starter-storage` 已有对应设计可参考）。
- 幂等性、API 版本控制、敏感字段脱敏、分布式链路追踪——按 YAGNI 推迟，真实需求出现时再设计。
