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
│   ├── aiko-boot-core/                    # 自动配置基座、统一响应/异常、通用注解
│   ├── aiko-boot-starter-web/             # Web 层封装
│   ├── aiko-boot-starter-orm/             # MyBatis-Plus 封装
│   ├── aiko-boot-starter-cache/
│   ├── aiko-boot-starter-log/
│   └── aiko-boot-starter-cloud/           # Spring Cloud 接入封装（注册中心/配置中心/网关客户端）
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

- Java 框架细节设计（`aiko-boot-core` 具体做什么、各 starter 的注解/配置项、`aiko-boot-services` 各服务的 API 契约与数据模型、是否需要额外的通用服务如文件存储/审计日志/字典/定时任务/网关限流等）——另开一次 brainstorming spec。
- `packages/*`、`app/framework/*` 向 `backend/`、`frontend/` 的实际迁移——待 Java 框架落地、frontend 有实际内容承接时再做。
