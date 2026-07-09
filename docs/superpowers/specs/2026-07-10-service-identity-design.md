# service-identity 详细设计（登录鉴权 + RBAC）

- 日期：2026-07-10
- 状态：设计稿，供 Cursor 生成代码用
- 前置：[2026-07-09-java-backend-first-implementation-slice-design.md](2026-07-09-java-backend-first-implementation-slice-design.md)（已确认 Sa-Token 作为身份域框架，`service-identity` 骨架已存在，端口 9102）

## 背景与边界

`service-user`（已实现）已有 `sys_user` 表（`username`/`email`/`phone`/`status`，无密码字段）。`service-identity` **不重复建用户表**，只建自己的登录凭证表，通过用户 ID 关联 `service-user`（用户已确认这个边界）。职责划分：

- `service-user`：用户档案（谁是谁）
- `service-identity`：登录凭证 + 会话/Token + 角色权限（谁能干什么）

`service-identity-biz` 依赖 `service-user-api`（拿 `UserApi` 接口做本地调用，验证用户是否存在/是否被禁用），不依赖 `service-user-biz`。

## 技术选型

- **Sa-Token**：`cn.dev33:sa-token-spring-boot3-starter:1.44.0`（已在上一轮 spec 确认）
- **分布式 Session**：`cn.dev33:sa-token-dao-redis-jackson:1.44.0` + `spring-boot-starter-data-redis`（合并部署/独立部署都用 Redis 存 Token，保证多实例场景下 Token 有效，且不依赖内存 Session）
- **密码哈希**：`org.springframework.security:spring-security-crypto`（只引入这一个轻量模块的 `BCryptPasswordEncoder`，**不引入完整 Spring Security**——这是当初"Sa-Token 而非 Spring Security"决策的自然延伸，没必要为了一个哈希函数引入整套安全框架）

## 数据模型

```sql
-- service-identity-biz/src/main/resources/db/migration/identity/V1__create_identity_tables.sql

CREATE TABLE sys_user_credential (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,              -- 关联 service-user 的 sys_user.id，不建外键（跨服务/跨库场景下外键不可用）
    password_hash VARCHAR(100) NOT NULL,  -- BCrypt 输出定长 60，留余量
    password_updated_at TIMESTAMP NOT NULL,
    login_fail_count INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,               -- 连续失败次数超限后的锁定截止时间，NULL 表示未锁定
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_credential_tenant_user UNIQUE (tenant_id, user_id)
);

CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    role_code VARCHAR(64) NOT NULL,       -- 角色标识，如 "admin"、"operator"
    role_name VARCHAR(64) NOT NULL,       -- 展示名
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_role_tenant_code UNIQUE (tenant_id, role_code)
);

CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    permission_code VARCHAR(128) NOT NULL, -- 权限标识，如 "system:user:add"（模块:资源:操作 三段式）
    permission_name VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_permission_tenant_code UNIQUE (tenant_id, permission_code)
);

CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_role_permission UNIQUE (tenant_id, role_id, permission_id)
);

CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,              -- 关联 service-user 的 sys_user.id
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_user_role UNIQUE (tenant_id, user_id, role_id)
);
```

命名沿用"三段式权限码"惯例（`模块:资源:操作`，如 `system:user:add`/`system:user:delete`），这是若依/Pig 一脉的标准做法，前端按钮级鉴权直接用这个字符串比对。

## 模块结构

所有 entity（`UserCredential`/`Role`/`Permission`/`RolePermission`/`UserRole`）都 `extends com.aikoboot.orm.entity.BaseEntity`（`aiko-boot-starter-orm`，Task 3 已实现）——上面 SQL 里的 `tenant_id`/四个审计字段/`deleted` 列就是对应 `BaseEntity` 的字段，不要重新定义，也不要在业务字段之外再手写这几列。

```
service-identity/
├── service-identity-api/
│   └── com.aikoboot.identity.api/
│       ├── IdentityApi.java              # login/logout/getCurrentUser/hasPermission
│       └── dto/
│           ├── LoginRequest.java          # username, password
│           ├── LoginResponse.java         # token, userId, username, roles, permissions
│           └── CurrentUserDTO.java        # userId, username, roles[], permissions[]
├── service-identity-biz/
│   └── com.aikoboot.identity/
│       ├── entity/ (UserCredential, Role, Permission, RolePermission, UserRole)
│       ├── mapper/ (对应 5 张表)
│       ├── service/
│       │   ├── IdentityServiceImpl.java   # implements IdentityApi
│       │   └── AikoStpInterfaceImpl.java  # implements Sa-Token 的 StpInterface，供框架查询角色/权限
│       └── config/
│           └── PasswordEncoderConfig.java # BCryptPasswordEncoder Bean
└── service-identity-starter/
    ├── controller/
    │   └── AuthController.java            # /api/auth/login, /api/auth/logout, /api/auth/current
    └── application.yml                    # + sa-token 配置块 + redis 连接 + flyway locations
```

## 核心接口

```java
package com.aikoboot.identity.api;

public interface IdentityApi {
    LoginResponse login(LoginRequest request);
    void logout(String token);
    CurrentUserDTO getCurrentUser(Long userId);
    boolean hasPermission(Long userId, String permissionCode);
}
```

**登录流程**（`IdentityServiceImpl.login`）：
1. 按 `username` 通过 `UserApi.getByUsername(username)`（**需要给 `service-user-api` 新增这个方法**——目前 `UserApi` 只有 `getById`，没有按用户名查询，这是本轮要一起补的接口扩展）拿到 `UserDTO`；用户不存在或 `status != 1` 直接拒绝登录
2. 查 `sys_user_credential` 表拿 `password_hash`；`BCryptPasswordEncoder.matches(rawPassword, hash)` 校验
3. 校验失败：`login_fail_count + 1`；超过阈值（如 5 次）设置 `locked_until`（如 15 分钟后）；`locked_until` 未过期直接拒绝
4. 校验成功：`login_fail_count` 清零；`StpUtil.login(userId)` 生成 Token；查 `sys_user_role`/`sys_role_permission` 拼出角色码列表和权限码列表，写入 `LoginResponse`

**权限查询**（`AikoStpInterfaceImpl implements StpInterface`）：Sa-Token 框架在 `@SaCheckPermission("system:user:add")` 注解触发时会回调这个接口的 `getPermissionList(loginId, loginType)`/`getRoleList(loginId, loginType)`，直接查 `sys_user_role` → `sys_role_permission` → `sys_permission` 拼出字符串列表返回，不需要手动维护缓存（Sa-Token 自己在 Session 级别做了缓存）。

**登录态与 `CurrentUserContext` 的接线**：新增一个 `AikoIdentityFilter`（放在 `service-identity` 里，不放共享的 `aiko-boot-starter-web`——因为只有接了身份服务的应用才需要它），在请求进入时调用 `StpUtil.getLoginIdDefaultNull()`，取到就 `CurrentUserContext.setUserId(...)`，`finally` 里 `clear()`（和 `TenantContextFilter` 同样的模式，之前的最终审查已经提醒过这个点要配对）。

## API 端点（service-identity-starter）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 用户名+密码登录，返回 token + 角色/权限 |
| POST | `/api/auth/logout` | 登出（`StpUtil.logout()`） |
| GET | `/api/auth/current` | 当前登录用户信息（从 Token 解析） |

鉴权失败（未登录/权限不足）时的响应：Sa-Token 抛出的 `NotLoginException`/`NotPermissionException` 需要在 `service-identity-starter` 里补一个 `@RestControllerAdvice`（不放共享 `GlobalExceptionHandler` 里，因为 Sa-Token 相关异常只有接了身份服务的应用才可能遇到），统一转成 `Result.fail(401, "未登录")` / `Result.fail(403, "无权限")`。

## 对 service-user-api 的扩展需求（这次一起做）

`UserApi` 目前只有 `getById`，需要新增：

```java
UserDTO getByUsername(String username);
```

`UserServiceImpl`（`service-user-biz`）对应加一个 `userMapper.selectOne(new QueryWrapper<User>().eq("username", username))` 的实现，返回 `null` 时 `IdentityServiceImpl` 按用户不存在处理（不抛异常，因为"用户名不存在"是登录接口的正常业务分支，不是异常）。

## application.yml 追加内容

```yaml
sa-token:
  token-name: satoken
  timeout: 2592000        # 30 天
  is-concurrent: true      # 允许同一账号多端登录
  is-share: false          # 每次登录生成不同 token
  token-style: uuid
sa-token-dao-redis:
  # 使用 sa-token-dao-redis-jackson，配置走 spring.data.redis.* 标准配置
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

**注意**：Redis 是硬依赖（分布式 Session 存储），本地开发/`mvn test` 环境需要一个真实或嵌入式 Redis（如 testcontainers 或本地装的 Redis），这点和 `service-user` 用 H2 内存库"零配置"不同，写实施计划时要提前说明。

## 验收标准

- [ ] `sys_user_credential`/`sys_role`/`sys_permission`/`sys_role_permission`/`sys_user_role` 五张表通过 Flyway 迁移建好
- [ ] `POST /api/auth/login` 用正确用户名密码能登录成功，返回 token
- [ ] 错误密码连续 5 次触发锁定，锁定期内登录直接拒绝
- [ ] 带 token 调一个标了 `@SaCheckPermission` 的接口，有权限放行、无权限返回 403
- [ ] `UserApi.getByUsername` 新增方法在 `service-user` 里可用
- [ ] `mvn -f backend/pom.xml package -DskipTests` 全量构建成功
