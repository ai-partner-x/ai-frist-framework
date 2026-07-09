# 仓库顶层布局重组 + Java 后端骨架 设计

- 日期：2026-07-09
- 状态：已批准（设计阶段），待写实施计划

## 背景

`aiko-boot` 目前是纯 TypeScript 的全栈框架（Spring Boot 风格 DI/自动配置 + MyBatis-Plus 风格 ORM），并通过 `aiko-boot-codegen` 把 TS 代码转译成 Java Spring Boot 项目。仓库现状：

- `packages/*`：TS 核心框架 + starters + CLI + codegen
- `app/framework/*`：前端共享组件库（admin-component / api-component / mall-component）
- `app/examples/*`：5 个示例应用（user-crud、admin、api-extend、cache-crud、mq-memory-tests），其中 `user-crud` 自带独立的 `pnpm-workspace.yaml`（因为一次重构 [f799b9e] 把 `app/framework/*`、`app/examples/*` 从根 `pnpm-workspace.yaml` 移除后，示例的 `workspace:*` 依赖解不出来，`user-crud` 通过补一份自己的 workspace 文件绕开了这个问题；`app/examples/admin` 在本次会话中用同样方式补了 workspace 文件）
- `scaffold/`：`aiko-boot-cli` 的 `create`/`init` 命令实际使用的项目模板源（已经是 api/admin/mobile/core 结构），与本次仓库重组无关，不变

用户希望：
1. 新增一套独立的 Java 手写开发框架（不依赖、不被 `aiko-boot-codegen` 消费，纯粹面向直接写 Java 的团队），支持 Spring Boot + Spring Cloud，能支撑移动端/管理端/中台的 API 开发。
2. 同时提供跨领域通用的平台基础服务：用户、权限、认证、消息（短信/邮件/其他），并且未来可能有更多通用服务（本设计只搭骨架，不枚举完整服务清单）。
3. 借这个机会把仓库顶层目录按 前端/后端/移动端/示例 重新分层。

**长期方向（用户已确认）**：TS 服务端框架（`packages/` 下的 aiko-boot 核心 + 各 starter）和 `aiko-boot-codegen`（TS→Java 转译器）后续将被删除，这套 Java 框架是唯一的后端未来。因此 `backend/` = Java 的命名是自洽的，不存在"两套后端并存"的长期状态；前端组件库（`app/framework/*`）不受影响，继续保留并迁往 `frontend/`。删除 TS 服务端的时机与迁移方案不在本 spec 范围内。

用户产品思路是"中台"：用户/认证/权限/消息等基础服务要能被多条产品线复用，复用方式既要支持"作为独立部署的微服务通过 API/事件调用"，也要支持"作为可组合打包的库在同一进程里合并部署"。

## 目标

- 确定仓库新的顶层目录结构，并把风险最低、验证最容易的一块（`app/examples/*`）实际迁移到位。
- 为 Java 后端框架划定物理落地位置和 Maven 多模块骨架（模块清单 + 依赖关系），使其从第一行代码开始就在正确的结构里，不需要日后二次搬迁。
- 骨架要天然支持"独立部署"和"合并部署"两种基础服务消费方式。

## 非目标（本次不做）

- 不迁移 `packages/*`（TS aiko-boot 全家桶）和 `app/framework/*`（前端组件库）——留到后续单独批次。
- 不设计 Java 框架/基础服务的具体类、接口、API 契约、数据库表结构——留给后续专门的 Java 框架 spec。
- 不重写 `.qoder/repowiki/` 下的自动生成文档（第三方工具 Qoder 的仓库百科快照，60+ 篇），迁移后会过期，通过 Qoder 工具重新生成，不手工维护。
- 不实现任何 Java 代码逻辑，只搭骨架（空 `pom.xml` + 占位包结构，保证 `mvn` 能跑通）。

## 设计一：仓库顶层目录结构

```
aiko-boot/
├── frontend/           # 新建，暂空占位 —— 未来承接 app/framework/*（本次不搬）
├── backend/            # 新建 —— Java Maven 多模块工程根（见设计二）
├── mobile/             # 新建，暂空占位 —— 未来的 Flutter 等原生应用
├── examples/           # 本次从 app/examples/* 整体迁入（唯一实际执行的迁移）
├── packages/           # 不变 —— TS aiko-boot 全家桶
├── app/framework/       # 不变 —— 前端组件库
├── scaffold/           # 不变 —— CLI 项目模板源
└── docs/ scripts/ ...   # 不变
```

`frontend/`、`mobile/` 只创建目录 + 一份说明性 `README.md`（写明用途和"这里以后放什么"），不移动任何现有代码。

## 设计二：backend/ 的 Java Maven 多模块骨架

```
backend/
├── pom.xml                                # 父 POM：版本仲裁（BOM）+ 聚合子模块
│
├── aiko-boot-framework/                   # 框架层聚合模块（库，供各 Java 项目 Maven 依赖引用）
│   ├── pom.xml
│   ├── aiko-boot-core/                    # 统一响应/异常码、租户上下文、合并部署规约、通用注解（并吸收缓存 key 租户前缀、MDC 日志上下文等小块价值）
│   ├── aiko-boot-starter-web/             # 统一响应体自动包装、全局异常处理器、租户上下文 Filter、Jackson 统一配置
│   ├── aiko-boot-starter-orm/             # MyBatis-Plus 统一配置：租户行级拦截器（TenantLineInnerInterceptor）、分页、字段自动填充、逻辑删除——租户硬约束的主要载体
│   └── aiko-boot-starter-cloud/           # 跨服务租户/用户上下文透传拦截器 + 合并部署时 Feign 自动本地调用机制——两条硬约束的载体
│
└── aiko-boot-services/                    # 基础服务聚合模块（中台，跨产品线复用）
    ├── pom.xml
    ├── service-user/
    │   ├── service-user-api/              # 对外契约：DTO + Feign/RPC 接口定义
    │   ├── service-user-biz/              # 业务实现：Service/Entity/Mapper，纯库，无 main()
    │   └── service-user-starter/          # 独立部署壳：Application.java + application.yml
    ├── service-auth/                      # 同 service-user 三段结构
    ├── service-permission/                # 同上
    ├── service-message/                   # 同上（短信/邮件/其他通道）
    └── platform-bootstrap/                # 组合部署壳：按需依赖多个 *-biz 模块，单进程合并启动
```

**分层职责**：

| 模块 | 职责 | 消费方式 |
|---|---|---|
| `*-api` | DTO + 远程调用接口定义，无实现 | 其他服务/产品线 Maven 依赖引用，只拿契约 |
| `*-biz` | 业务逻辑实现，无 `main()`，不可独立运行 | 被 `*-starter` 或 `platform-bootstrap` 组合进最终可运行产物；对外通过标准 Spring `@ConditionalOnMissingBean` 开放扩展点 |
| `*-starter` | 独立部署壳，一个服务一个 `main()` | 直接部署为一个微服务进程 |
| `platform-bootstrap` | 组合部署壳，依赖多个 `*-biz` | 把选中的若干基础服务合并部署进同一个进程（降低小规模场景的运维成本） |

**框架层模块经过克制原则筛选（用户已确认）**：原方案中的 `starter-cache` 和 `starter-log` 已砍掉——对比官方 starter 的增量（缓存 key 租户前缀、MDC 租户/用户上下文、统一 JSON 日志格式）体量太小，不足以成模块，其价值并入 `aiko-boot-core`；将来若出现多级缓存等真实需求、能回答"比官方多什么"时再立项。

`aiko-boot-framework` 下各模块本次只建空 `pom.xml`（继承父 POM，声明 `packaging: jar`），`aiko-boot-services` 下各模块只建空 `pom.xml` + 一个空的 `src/main/java/<package>/.gitkeep` 占位（`*-starter` 和 `platform-bootstrap` 额外放一个空的 `Application.java` 骨架，保证 `mvn spring-boot:run` 至少能空跑起来）。具体依赖版本、包名规范（groupId 用 `com.ai-partner-x`，与 TS 侧 `aiko-boot-codegen` 生成的 pom.xml 保持一致）、Spring Boot/Cloud 版本选型，写实施计划时确定。

## 设计三：examples/ 迁移机制

**迁移范围**：`app/examples/{user-crud,admin,api-extend,cache-crud,mq-memory-tests}` 整体 `git mv` 到根目录 `examples/`。迁移后若 `app/` 目录清空则一并删除。

**必须同步更新的引用**：

1. `examples/user-crud/pnpm-workspace.yaml`：`../../../packages/*` → `../../packages/*`，`../../framework/*` → `../app/framework/*`
2. `examples/admin/pnpm-workspace.yaml`：同样各少一层 `../`
3. `.claude/launch.json`：三条已注册的启动配置（`user-crud-admin`、`erp-admin`、`user-crud-mobile`）路径同步更新
4. 根 `README.md`："运行示例项目" 一节的 `cd app/examples/user-crud/...` 路径
5. `docs/guide/api-development.md`、`packages/aiko-boot-starter-cache/README.md` 中的路径引用
6. `.github/workflows/opencode.yml`、`.github/workflows/rules/pr-review-rules-admin.md`、`.github/workflows/rules/pr-review-rules-mobile.md`：PR 审查规则里的路径规则。顺带修正一个既有问题——`pr-review-rules-mobile.md` 写的是 `app/examples/mobile/`，这个路径从未真实存在过，真正的移动端示例是 `app/examples/user-crud/packages/mall-mobile`，一并改成准确路径 `examples/user-crud/packages/mall-mobile/`

**明确不动**：`.qoder/repowiki/` 下引用旧路径的文档（见"非目标"）。

**验证方式**：迁移完成后，用本次会话中已经跑通的 4 个服务重新验证一遍：
- `examples/user-crud/packages/api`（后端 API，`localhost:3001`）
- `examples/user-crud/packages/admin`（`localhost:3000`）
- `examples/admin`（ERP admin，`localhost:5173`）
- `examples/user-crud/packages/mall-mobile`（`localhost:3002`）

全部能重新 `pnpm install` + 启动 + 出正确数据，即认为迁移未破坏引用。

## 验收标准

- [ ] `frontend/`、`mobile/` 目录存在，各有一份说明性 README
- [ ] `backend/` 下 Maven 多模块骨架建好，`mvn -f backend/pom.xml validate`（或等价的构建校验命令）通过
- [ ] `app/examples/*` 不再存在，`examples/*` 存在且内容一致
- [ ] 上述 6 类引用全部更新，无死链接残留（`app/examples` 字符串在 `.qoder/` 之外的仓库范围内不再出现，CI 配置文件除外需人工确认）
- [ ] 4 个示例服务重新验证全部可正常启动并返回预期数据

## 后续（不在本次范围内）

- Java 框架细节设计——另开一次 brainstorming spec，**下方"Java 框架 spec 必答清单"是该 spec 的硬性输入**。
- `packages/*`、`app/framework/*` 向 `backend/`、`frontend/` 的实际迁移——待 Java 框架落地、frontend 有实际内容承接时再做。
- TS 服务端框架 + `aiko-boot-codegen` 的退役删除——待 Java 框架可用后单独规划。

## Java 框架 spec 必答清单（用户已确认这些必须设计进去）

以下各项在下一轮 Java 框架细节设计中必须给出明确答案，不允许"以后再说"：

1. **多租户数据模型（硬约束）**：中台定位意味着用户/认证等服务被多产品线共用。所有平台服务的表**从第一天起就必须带租户/产品维度**（`tenant_id` 或等价字段），即使初期只有一个产品。该字段后补的代价（全量数据迁移 + 所有查询改造）远高于先建。spec 需定义：租户模型（共享表 + tenant_id 列 vs 独立 schema）、租户上下文如何在请求链路中传递（token claim / header / ThreadLocal 规约）。
2. **合并部署规约（硬约束，`aiko-boot-core` 的核心职责）**：`platform-bootstrap` 合并多个 `*-biz` 时的冲突问题必须由框架规约从第一个服务开始就预防，而不是合并时补救：
   - 配置项命名空间：每个服务的配置必须挂在自己的前缀下（如 `aiko.services.user.*`），禁止直接占用顶层通用键；
   - 数据库迁移：每个 `*-biz` 独立管理自己的 Flyway/Liquibase 历史表（或表前缀隔离），合并进同一个库时互不干扰；
   - Bean 命名：包路径 + 命名规约避免跨服务 Bean 名冲突；
   - 本地调用优先：`*-api` 中的 Feign/RPC 接口在合并部署时必须自动走进程内本地实现而非 HTTP 回环（Feign 接口 + 本地 `@ConditionalOnBean` 实现优先的机制）。
3. **身份域粒度评估**：认证（authentication）与授权（authorization）在请求链路上总是一起使用，拆成 `service-auth` + `service-permission` 两个独立服务会引入每请求一跳的代价。spec 需认真评估是否先合并为单一 `service-identity`（内部分模块），待有独立扩缩容需求再拆——拆比合容易。目录骨架阶段保留三个空模块不影响该决策。
4. **框架层克制原则**：`aiko-boot-framework` 下每个 starter 必须回答"它比直接用 Spring Boot 官方 starter 多了什么"（统一响应体/异常码、合并部署规约、公司级默认配置等），答不上来的模块砍掉，避免纯粹换名转发的"薄封装"维护负担。
5. **Spring Cloud 技术栈选型（第一个要回答的问题）**：Spring Cloud Alibaba（Nacos/Sentinel/Seata）vs Spring Cloud 原生（Consul/Config 等），连带确定 Spring Boot 3.x 版本与 JDK 版本（17 或 21）。这决定父 POM 的依赖管理和 `starter-cloud` 的全部内容。
6. **数据扩展机制**：产品线对平台实体（如用户）的定制字段如何承载——扩展表、JSON 列、还是 SPI 挂钩，spec 需给出统一策略，避免各产品各自改平台表。
7. **通用服务清单盘点**：除用户/认证/权限/消息外，评估文件存储、审计日志、数据字典、定时任务、ID 生成、网关/限流等是否纳入首批。
