# service-storage 详细设计（MinIO / S3 兼容协议）

- 日期：2026-07-10
- 状态：设计稿，供 Cursor 生成代码用
- 前置：[2026-07-09-java-backend-first-implementation-slice-design.md](2026-07-09-java-backend-first-implementation-slice-design.md)（`service-storage` 骨架已存在，端口 9104）

## 范围（用户已确认）

第一批只做 **MinIO / S3 兼容协议**一种后端（不做本地磁盘、不做阿里云 OSS/腾讯云 COS）。因为 MinIO 本身实现的就是 S3 协议，用 AWS 官方 S3 SDK（v2）配一个自定义 endpoint 指向 MinIO 服务器即可，同一套代码将来接真正的 AWS S3 也完全不用改，只改配置。

## 技术选型（本次新查证）

`software.amazon.awssdk:s3`（AWS SDK for Java 2.x，groupId `software.amazon.awssdk`），确认在 Maven Central 上有效发布（如 `2.34.0`）。落地代码时核实当前最新版本号，本 spec 不锁定具体патч版本。

**MinIO 兼容的关键配置点**（AWS SDK 默认行为对 AWS 官方 S3 生效，但对着 MinIO 用必须显式改两处，否则请求会失败或行为不对）：
1. **Path-style addressing**：AWS SDK 默认用 virtual-hosted-style（`https://bucket.s3.amazonaws.com/key`），MinIO 需要 path-style（`https://minio-host:9000/bucket/key`）——必须在 `S3Configuration` 里显式 `.pathStyleAccessEnabled(true)`
2. **自定义 endpoint**：`S3Client.builder().endpointOverride(URI.create(minioEndpoint))`
3. **Region 仍然要填一个值**（哪怕 MinIO 不关心 region），SDK 强制要求，随便填 `us-east-1` 即可

## 数据模型

```sql
-- service-storage-biz/src/main/resources/db/migration/storage/V1__create_storage_tables.sql

CREATE TABLE file_record (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    bucket VARCHAR(64) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,     -- 对象在桶里的完整路径，如 "avatars/2026/07/10/xxx.png"
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(64) NOT NULL,
    deleted INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_file_record_key UNIQUE (bucket, storage_key)
);
```

## 模块结构

`FileRecord` entity `extends com.aikoboot.orm.entity.BaseEntity`（`aiko-boot-starter-orm`，Task 3 已实现）——上面 SQL 里的 `tenant_id`/四个审计字段/`deleted` 列对应 `BaseEntity` 的字段，不要重新定义。

**Controller 放在 `-biz` 里，不是 `-starter`**（`service-user` 那边一次真实 bug 修复得到的教训）：`platform-bootstrap`（合并部署壳）只依赖各服务的 `*-biz` 模块。Controller 放 `-starter` 的话，合并部署时这个类根本不在 classpath 上，接口不存在。`*-biz` 不是"没有 web 层"，只是"没有 `main()`"。

```
service-storage/
├── service-storage-api/
│   └── com.aikoboot.storage.api/
│       ├── StorageApi.java
│       └── dto/
│           ├── FileRecordDTO.java          # id, storageKey, originalFilename, contentType, sizeBytes, url
│           └── PresignedUrlDTO.java        # url, expiresAt
├── service-storage-biz/                    # 依赖 aiko-boot-starter-web（Controller 需要）
│   └── com.aikoboot.storage/
│       ├── entity/FileRecord.java
│       ├── mapper/FileRecordMapper.java
│       ├── config/
│       │   └── S3ClientConfig.java         # S3Client Bean（endpoint override + path-style + region）
│       ├── service/
│       │   └── StorageServiceImpl.java     # implements StorageApi
│       └── controller/
│           └── FileController.java         # POST 上传（multipart）/ GET 下载或预签名URL / DELETE
└── service-storage-starter/                # 只有部署壳，不放业务代码
    └── application.yml                     # + aiko.storage.s3.* 配置块
```

**另一个连带教训**：`platform-bootstrap` 的 `PlatformApplication` 用 `@MapperScan(value = "com.aikoboot", markerInterface = BaseMapper.class)` 扫描所有服务的 Mapper——`markerInterface` 这个限定必须有，光写包名会把 `StorageApi` 这类普通业务接口误判成 Mapper 代理，运行时报 `BindingException`。这个注解已经在骨架里配好了，不需要再改。

## 核心接口

```java
package com.aikoboot.storage.api;

import org.springframework.web.multipart.MultipartFile;

public interface StorageApi {
    FileRecordDTO upload(MultipartFile file, String folder);   // folder 如 "avatars"，用于组织 storage_key 前缀
    byte[] download(Long fileRecordId);
    PresignedUrlDTO getPresignedUrl(Long fileRecordId, int expirySeconds);
    void delete(Long fileRecordId);
}
```

**`upload` 的 key 生成规则**：`{folder}/{yyyy}/{MM}/{dd}/{雪花ID}.{原始扩展名}`——按日期分目录避免单目录文件数爆炸（对象存储虽然没有真正的"目录"，但这个前缀习惯有利于后续按时间做生命周期管理/归档策略）。

**`S3ClientConfig`**：

```java
package com.aikoboot.storage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class S3ClientConfig {

    @Bean
    public S3Client s3Client(StorageProperties props) {
        return S3Client.builder()
                .endpointOverride(URI.create(props.getEndpoint()))
                .region(Region.of(props.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey())))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)   // MinIO 必须要这个
                        .build())
                .build();
    }
}
```

（`StorageProperties` 是一个 `@ConfigurationProperties(prefix = "aiko.storage.s3")` 的普通配置类，字段：`endpoint`/`region`/`accessKey`/`secretKey`/`bucket`，仿照本轮其他 `*Properties` 类的写法即可，这里不重复贴代码。）

**预签名 URL**：用 `S3Presigner`（同一个 SDK 里的类，需要额外一个 `S3Presigner` Bean，构造方式和 `S3Client` 类似）生成有时效性的临时访问链接，避免直接把桶设为公开可读——这是对象存储的标准安全实践，私有桶 + 按需签发临时链接。

## API 端点（service-storage-biz）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/files` | 上传文件（`multipart/form-data`，`file` + `folder` 两个字段） |
| GET | `/api/files/{id}/url` | 获取预签名下载链接（`?expirySeconds=3600`，默认 1 小时） |
| DELETE | `/api/files/{id}` | 删除文件（同时删 `file_record` 记录和对象存储里的实际对象） |

**不提供直接下载接口返回文件二进制**（没有 `GET /api/files/{id}` 直接吐 `byte[]`）——大文件走应用服务器中转会占用应用实例带宽和内存，标准做法是让客户端拿到预签名 URL 后直接对接对象存储服务器，这也是加预签名 URL 机制的意义所在。`StorageApi.download` 这个方法保留是给**服务内部**需要读取文件内容做处理的场景用（比如以后要做图片压缩/水印之类的需求），不通过 HTTP 接口暴露。

## application.yml 追加内容

```yaml
aiko:
  storage:
    s3:
      endpoint: ${STORAGE_S3_ENDPOINT:http://localhost:9000}   # MinIO 默认端口 9000
      region: us-east-1
      bucket: ${STORAGE_S3_BUCKET:aiko-boot-dev}
      access-key: ${STORAGE_S3_ACCESS_KEY:}
      secret-key: ${STORAGE_S3_SECRET_KEY:}
```

同样，AK/SK 走环境变量占位，不写死。

## 验收标准

- [ ] `file_record` 表通过 Flyway 迁移建好
- [ ] 本地跑一个 MinIO 实例（`docker run -p 9000:9000 minio/minio server /data`），配置指向它，`POST /api/files` 上传成功，MinIO 控制台能看到对象
- [ ] `GET /api/files/{id}/url` 返回的预签名链接能直接在浏览器打开下载文件
- [ ] `DELETE /api/files/{id}` 后 MinIO 里对象和 `file_record` 记录都被清除
- [ ] `mvn -f backend/pom.xml package -DskipTests` 全量构建成功
