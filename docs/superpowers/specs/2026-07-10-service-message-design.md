# service-message 详细设计（短信 + 邮件 + 站内信 + 极光推送）

- 日期：2026-07-10
- 状态：设计稿，供 Cursor 生成代码用
- 前置：[2026-07-09-java-backend-first-implementation-slice-design.md](2026-07-09-java-backend-first-implementation-slice-design.md)（`service-message` 骨架已存在，端口 9103）

## 范围（用户已确认）

第一批支持四个通道：短信（阿里云/腾讯云可插拔）、邮件（SMTP）、站内信（应用内通知）、极光推送（移动端 push）。

## 技术选型（本次新查证，非既有知识）

| 通道 | SDK 坐标 | 备注 |
|---|---|---|
| 阿里云短信 | `com.aliyun:dysmsapi20170525`（groupId `com.aliyun`） | 版本号写实施计划/落地代码时查 Maven Central 最新版，本 spec 不锁定具体патч版本 |
| 腾讯云短信 | `com.tencentcloudapi:tencentcloud-sdk-java-sms`（参考版本 `3.1.754`） | 同上，落地时核实最新版 |
| 邮件 | `spring-boot-starter-mail`（Spring 官方，BOM 管理版本） | 走标准 `JavaMailSender`，无需额外选型 |
| 极光推送 | `io.github.jpush:jiguang-sdk`（官方现行 SDK，参考版本 `5.3.0`） | 旧版 `cn.jpush.api:jpush-client` 已是历史 SDK，选新的；落地时核实最新版 |

站内信不需要外部 SDK，纯数据库 + API。

## 数据模型

```sql
-- service-message-biz/src/main/resources/db/migration/message/V1__create_message_tables.sql

-- 短信模板：本地编码 -> 供应商已审核模板的映射（供应商方要求短信内容必须走预审核模板，不能拼自由文本）
CREATE TABLE msg_sms_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    template_code VARCHAR(64) NOT NULL,        -- 业务代码里引用的编码，如 "user_register_verify_code"
    provider VARCHAR(20) NOT NULL,              -- aliyun / tencent
    provider_template_id VARCHAR(64) NOT NULL,  -- 供应商侧模板 ID
    sign_name VARCHAR(64) NOT NULL,             -- 短信签名
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_sms_template UNIQUE (tenant_id, template_code, provider)
);

-- 统一发送日志：四个通道共用一张表，便于审计和问题排查
CREATE TABLE msg_log (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    channel VARCHAR(20) NOT NULL,       -- SMS / EMAIL / IN_APP / PUSH
    target VARCHAR(255) NOT NULL,        -- 手机号 / 邮箱 / userId / 设备 registrationId
    subject VARCHAR(255),                -- 邮件用，其他通道可空
    content TEXT,
    status VARCHAR(20) NOT NULL,         -- SUCCESS / FAILED
    error_message VARCHAR(500),
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0
);

-- 站内信收件箱
CREATE TABLE msg_inbox (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    read_status INT NOT NULL DEFAULT 0,  -- 0=未读 1=已读
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0
);
```

## 模块结构

所有 entity（`SmsTemplate`/`MessageLog`/`InboxMessage`）都 `extends com.aikoboot.orm.entity.BaseEntity`（`aiko-boot-starter-orm`，Task 3 已实现）——上面 SQL 里的 `tenant_id`/四个审计字段/`deleted` 列对应 `BaseEntity` 的字段，不要重新定义。

**Controller 放在 `-biz` 里，不是 `-starter`**（`service-user` 那边一次真实 bug 修复得到的教训）：`platform-bootstrap`（合并部署壳）只依赖各服务的 `*-biz` 模块。Controller 放 `-starter` 的话，合并部署时这个类根本不在 classpath 上，接口不存在。`*-biz` 不是"没有 web 层"，只是"没有 `main()`"。

```
service-message/
├── service-message-api/
│   └── com.aikoboot.message.api/
│       ├── MessageApi.java
│       └── dto/
│           ├── SendSmsRequest.java        # phone, templateCode, params(Map<String,String>)
│           ├── SendEmailRequest.java      # to, subject, content, html(boolean)
│           ├── SendInAppRequest.java      # userId, title, content
│           ├── SendPushRequest.java       # userId, title, content, extra(Map<String,String>)
│           └── InboxMessageDTO.java       # id, title, content, readStatus, createdAt
├── service-message-biz/                   # 依赖 aiko-boot-starter-web（Controller 需要）
│   └── com.aikoboot.message/
│       ├── entity/ (SmsTemplate, MessageLog, InboxMessage)
│       ├── mapper/
│       ├── channel/
│       │   ├── SmsProvider.java           # send(phone, providerTemplateId, params, signName) 接口
│       │   ├── AliyunSmsProvider.java     # implements SmsProvider, @ConditionalOnProperty(aiko.message.sms.provider=aliyun)
│       │   └── TencentSmsProvider.java    # implements SmsProvider, @ConditionalOnProperty(aiko.message.sms.provider=tencent)
│       ├── service/
│       │   └── MessageServiceImpl.java    # implements MessageApi，四个 send 方法 + 站内信查询/已读
│       └── controller/
│           └── MessageController.java     # /api/messages/sms, /email, /inbox 等
└── service-message-starter/               # 只有部署壳，不放业务代码
    └── application.yml                    # + 阿里云/腾讯云/JPush/SMTP 各自的配置块
```

**另一个连带教训**：`platform-bootstrap` 的 `PlatformApplication` 用 `@MapperScan(value = "com.aikoboot", markerInterface = BaseMapper.class)` 扫描所有服务的 Mapper——`markerInterface` 这个限定必须有，光写包名会把 `MessageApi` 这类普通业务接口误判成 Mapper 代理，运行时报 `BindingException`。这个注解已经在骨架里配好了，不需要再改。

## 核心接口

```java
package com.aikoboot.message.api;

public interface MessageApi {
    void sendSms(SendSmsRequest request);
    void sendEmail(SendEmailRequest request);
    void sendInApp(SendInAppRequest request);
    void sendPush(SendPushRequest request);

    List<InboxMessageDTO> listInbox(Long userId, boolean unreadOnly);
    void markInboxRead(Long messageId);
}
```

**短信供应商可插拔机制**（`aiko.message.sms.provider` 配置项）：

```java
package com.aikoboot.message.channel;

public interface SmsProvider {
    void send(String phone, String providerTemplateId, Map<String, String> params, String signName);
}
```

`AliyunSmsProvider`/`TencentSmsProvider` 各自 `@ConditionalOnProperty(prefix = "aiko.message.sms", name = "provider", havingValue = "aliyun"/"tencent")`，`MessageServiceImpl` 只依赖 `SmsProvider` 接口，不关心具体是哪家——同一套业务代码切换供应商只改配置，不改代码。这个模式和 `aiko-boot-core` 的"合并部署规约"里 `*-api`/`*-biz` 的接口隔离思路是一致的。

`MessageServiceImpl.sendSms` 的流程：按 `templateCode` 查 `msg_sms_template` 拿到 `provider`/`providerTemplateId`/`signName` → 调用对应的 `SmsProvider.send(...)` → 无论成功失败都写一条 `msg_log`（失败时 `error_message` 记录异常信息，但不让异常向上抛出中断调用方——发消息失败不应该让业务主流程也失败，这是消息类服务的标准设计原则，`sendSms`/`sendEmail`/`sendPush` 内部自己 `try-catch` 并记录日志）。

## API 端点（service-message-biz）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/messages/sms` | 发短信 |
| POST | `/api/messages/email` | 发邮件 |
| POST | `/api/messages/push` | 发推送 |
| POST | `/api/messages/inbox` | 发站内信（内部调用，不对外暴露到网关也可以） |
| GET | `/api/messages/inbox` | 查当前用户站内信列表（`?unreadOnly=true` 可选） |
| PUT | `/api/messages/inbox/{id}/read` | 标记已读 |

## application.yml 追加内容

```yaml
aiko:
  message:
    sms:
      provider: aliyun          # aliyun / tencent
      aliyun:
        access-key-id: ${SMS_ALIYUN_ACCESS_KEY_ID:}
        access-key-secret: ${SMS_ALIYUN_ACCESS_KEY_SECRET:}
      tencent:
        secret-id: ${SMS_TENCENT_SECRET_ID:}
        secret-key: ${SMS_TENCENT_SECRET_KEY:}
    push:
      jpush:
        app-key: ${JPUSH_APP_KEY:}
        master-secret: ${JPUSH_MASTER_SECRET:}
spring:
  mail:
    host: ${SMTP_HOST:smtp.example.com}
    port: ${SMTP_PORT:465}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
    properties:
      mail.smtp.auth: true
      mail.smtp.ssl.enable: true
```

所有敏感凭证（AK/SK、密钥）走环境变量占位（`${VAR:默认值}`），不写死在配置文件里——这是本条独立于 spec 讨论范围之外、但落地时必须遵守的基本安全惯例。

## 验收标准

- [ ] `msg_sms_template`/`msg_log`/`msg_inbox` 三张表通过 Flyway 迁移建好
- [ ] 配置 `aiko.message.sms.provider=aliyun` 时 `AliyunSmsProvider` 生效、`TencentSmsProvider` 不生效（反之亦然），可通过启动日志或条件注解验证
- [ ] 调用发短信/发邮件/发站内信/发推送任一接口后，`msg_log` 里能查到一条对应记录
- [ ] 站内信查询接口能正确区分已读/未读
- [ ] `mvn -f backend/pom.xml package -DskipTests` 全量构建成功
