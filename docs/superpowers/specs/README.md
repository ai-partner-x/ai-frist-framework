# Aiko Boot Java 后端 — 总体设计总览

这份文档是入口，把散在各个 spec 里的决策串成一张完整的图。每份 spec 管自己那一块的细节，这里只讲它们怎么拼在一起、现在到哪一步了、下一步是什么。

## 全局背景

`aiko-boot` 原本是纯 TypeScript 全栈框架（Spring Boot 风格 DI + MyBatis-Plus 风格 ORM），并通过 `aiko-boot-codegen` 把 TS 代码转译成 Java。**长期方向：TS 服务端 + codegen 会退役，`backend/` 下这套手写 Java 框架是唯一的后端未来**（前端组件库不受影响）。定位是"中台"——用户/身份/消息/存储这些基础服务要被多条产品线复用。

## 仓库顶层结构

```
aiko-boot/
├── frontend/           # 占位，未来承接 app/framework/*（前端组件库）
├── backend/            # Java Maven 多模块工程根 —— 本总览覆盖的范围
├── mobile/             # 占位，未来的 Flutter 等原生应用
├── examples/           # TS 示例（与 backend 无关，历史遗留）
├── packages/           # TS aiko-boot 全家桶（长期会退役）
├── app/framework/       # 前端组件库
└── scaffold/           # CLI 项目模板源（与 backend 无关）
```

## backend/ 模块树现状

```
backend/
├── pom.xml                                # 父 POM：Spring Boot 3.5.13 + Spring Cloud 2025.0.0 + Spring Cloud Alibaba 2025.0.0.0
│
├── aiko-boot-framework/                   # ✅ 已实现（框架层，库，Maven 依赖引用）
│   ├── aiko-boot-core/                    # ✅ 统一响应/异常、租户+操作人上下文、雪花ID序列化、时区
│   ├── aiko-boot-starter-web/             # ✅ 全局异常处理、响应包装、CORS、校验、OpenAPI、健康检查
│   ├── aiko-boot-starter-orm/             # ✅ BaseEntity、审计字段自动填充、租户+分页拦截器
│   └── aiko-boot-starter-cloud/           # 🔲 骨架，未实现（Spring Cloud Alibaba 接入封装）
│
└── aiko-boot-services/                    # 基础服务层（中台，跨产品线复用）
    ├── service-user/                      # ✅ 已实现——唯一完整跑通的服务，其他服务的参照模板
    ├── service-identity/                  # 🔲 骨架 + 详细 spec 已写，未实现（Sa-Token 登录鉴权 + RBAC）
    ├── service-message/                   # 🔲 骨架 + 详细 spec 已写，未实现（短信/邮件/站内信/推送）
    ├── service-storage/                   # 🔲 骨架 + 详细 spec 已写，未实现（MinIO/S3）
    └── platform-bootstrap/                # ✅ 合并部署已用 service-user 真实验证过（create+query 全链路跑通，不只是 mvn package 通过）
```

✅ = 有真实代码且已验证跑通；🔲 = 只有空壳（pom + 占位 Application 类），业务逻辑待实现。

## 关键架构决策（跨所有服务生效，写代码前必须知道）

这些决策不重复放在每份 spec 里，只在这里放一次，所有服务共用：

1. **技术栈**：Spring Boot `3.5.13`、Spring Cloud `2025.0.0`、Spring Cloud Alibaba `2025.0.0.0`（Nacos/Sentinel/Seata）、JDK 17、MyBatis-Plus `3.5.9`
2. **多租户**：所有实体带 `tenant_id` 列，`TenantLineInnerInterceptor` 从第一天起真实运行（不是"建了列但关着"），现阶段 `TenantContext` 恒返回 `"default"`。将来要上真多租户，只需要在请求入口调用 `TenantContext.setTenantId(真实值)`，ORM 层零改动
3. **审计字段**：所有实体 `extends com.aikoboot.orm.entity.BaseEntity`（`id` 雪花算法、`tenantId`、`createdAt`/`createdBy`/`updatedAt`/`updatedBy`、`deleted` 逻辑删除），自动填充，不要重新定义
4. **合并部署 vs 独立部署**：每个基础服务拆 `api`（契约接口+DTO）/`biz`（实现，无 main，依赖 `aiko-boot-core`）/`starter`（独立部署壳）。`platform-bootstrap` 依赖多个 `*-biz` 实现合并部署。跨服务调用走 `*-api` 接口，`*-biz` 本地实现 + `@ConditionalOnMissingBean` 的 Feign 兜底
5. **统一响应**：所有 REST 接口返回 `Result<T>`（`success`/`code`/`message`/`data`），HTTP 状态码恒 200，业务状态在 `code` 字段里
6. **统一异常**：`BizException` + 各服务自定义 `ErrorCode` 枚举实现（不在 core 里预置业务错误码）
7. **雪花 ID 序列化**：全局 Jackson 模块把 `Long` 序列化成字符串，前端拿到的 `id` 永远是字符串
8. **端口分配**：`platform-bootstrap` 9100、`service-user` 9101、`service-identity` 9102、`service-message` 9103、`service-storage` 9104
9. **Controller 必须放在 `-biz`，不是 `-starter`**（真实 bug 修复得到的教训，`service-user` 上踩过一次）：`platform-bootstrap` 只依赖 `*-biz` 模块，Controller 放 `-starter` 会导致合并部署下这个类根本不在 classpath 上，接口不存在。`*-biz` 不是"没有 web 层"，只是"没有 `main()`"——Controller、Filter、`@RestControllerAdvice`、`aiko-boot-starter-web` 依赖都要放 `-biz`；`-starter` 只保留 `Application.java` + `application.yml`
10. **`platform-bootstrap` 的 `@MapperScan` 必须带 `markerInterface = BaseMapper.class`**（同一次 bug 修复连带发现）：光写 `@MapperScan("com.aikoboot")` 会把 `UserApi` 这类普通业务接口也误判成 MyBatis Mapper 代理，运行时报 `BindingException`，且会被通用异常处理吞掉表现为莫名其妙的 500。这个已经在 `PlatformApplication` 里配好，新增服务不需要改这个文件，但如果发现合并部署报 500/启动失败，先检查这条

## 服务间关系图

```
                    ┌─────────────────┐
                    │ platform-bootstrap│  合并部署壳（可选，9100）
                    │  = 4个 *-biz 合体  │
                    └─────────────────┘
                              ▲
              ┌───────────────┼───────────────┬───────────────┐
              │               │               │               │
        service-user    service-identity  service-message  service-storage
         (9101, ✅)         (9102, 🔲)        (9103, 🔲)       (9104, 🔲)
              ▲               │
              │               │ 通过 UserApi.getByUsername()
              └───────────────┘  本地调用查用户
                  （service-identity 不重复建用户表，
                    只建自己的登录凭证表，靠 user_id 关联）
```

`service-message`/`service-storage` 目前和其他服务没有强耦合关系（谁都可以调用它们发消息/存文件），`service-identity` 是唯一一个明确依赖 `service-user`（通过 `UserApi` 接口，不是直接依赖 `service-user-biz`）的服务。

## 每份 spec 管什么

| Spec | 状态 | 内容 |
|---|---|---|
| [2026-07-09-repo-layout-and-java-backend-skeleton-design.md](2026-07-09-repo-layout-and-java-backend-skeleton-design.md) | ✅ 已实施并合并到 main | 仓库顶层布局重组 + `backend/` Maven 骨架搭建，"必答清单"提出 7 个待决策问题 |
| [2026-07-09-java-backend-first-implementation-slice-design.md](2026-07-09-java-backend-first-implementation-slice-design.md) | ✅ 已实施（当前分支，待合并） | 回答必答清单全部 7 项；`aiko-boot-core`/`starter-web`/`starter-orm` 三个框架模块从骨架变真实代码；`service-user` 全链路跑通；`service-identity`+`service-storage`+端口调整（模块树部分） |
| [2026-07-10-service-identity-design.md](2026-07-10-service-identity-design.md) | 📝 设计完成，未实现 | Sa-Token 登录鉴权、RBAC 五表模型、和 service-user 的边界划分 |
| [2026-07-10-service-message-design.md](2026-07-10-service-message-design.md) | 📝 设计完成，未实现 | 短信（阿里云/腾讯云可插拔）+ 邮件 + 站内信 + 极光推送 |
| [2026-07-10-service-storage-design.md](2026-07-10-service-storage-design.md) | 📝 设计完成，未实现 | MinIO/S3 兼容协议文件存储 |

## 还没有 spec、明确留白的部分

- `aiko-boot-starter-cloud` 的具体内容（目前只有骨架）——Nacos 服务注册、跨服务租户/用户上下文透传拦截器、合并部署时 Feign 自动走本地调用的具体机制，都还没设计
- 通用服务清单还要不要扩（审计日志、数据字典、定时任务、网关限流）——之前明确说"先不做，真有需求再评估"，没有结论
- `packages/*`（TS 全家桶）+ `app/framework/*`（前端组件库）向 `backend/`/`frontend/` 的实际迁移——排期未定
- TS 服务端 + `aiko-boot-codegen` 的具体退役方案（时间点、迁移路径）——只有"最终要退役"这个方向，没有计划

## 给 Cursor 用的建议顺序

1. 先确认这个总览 + 已实现的 `service-user` 代码（`backend/aiko-boot-services/service-user/`），作为其他服务的参照范式
2. 按 `service-identity` → `service-message` → `service-storage` 的顺序（这是依赖risk从高到低排的——identity 是其他服务未来会依赖的基础）
3. 每实现一个服务，跑 `mvn -f backend/pom.xml package -DskipTests` 验证一次，不要三个服务写完再一起测
