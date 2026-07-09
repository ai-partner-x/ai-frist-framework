# 仓库布局重组 + Java 后端骨架 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `app/examples/*` 迁移到根目录 `examples/`（同步全部引用），新建 `frontend/`、`mobile/` 占位目录，并在 `backend/` 落地 Java Maven 多模块骨架（框架层 4 模块 + 基础服务 api/biz/starter 三段拆分 + 合并部署壳）。

**Architecture:** 见已批准的 spec：`docs/superpowers/specs/2026-07-09-repo-layout-and-java-backend-skeleton-design.md`。本计划只搭骨架不写业务逻辑；每个基础服务拆 api（契约）/biz（实现库）/starter（独立部署壳），另有 platform-bootstrap 合并部署壳。

**Tech Stack:** Java 17（本机 Temurin 17.0.19）、Maven 3.9.9（本机已装）、Spring Boot 3.5.0（dependencyManagement 引入，不用 starter-parent 继承）、pnpm workspace（示例迁移部分）。

## Global Constraints

- Maven groupId：`com.ai-partner-x`（与 TS 侧 codegen 生成的 pom 一致）；Java 包名不能带连字符，统一用基础包 `com.aikoboot`
- 所有新 Maven 模块 version：`0.1.0-SNAPSHOT`
- JDK 17（`maven.compiler.release=17`），Spring Boot `3.5.0`
- 服务端口约定：platform-bootstrap 9100、service-user 9101、service-auth 9102、service-permission 9103、service-message 9104
- **不动**：`packages/*`、`app/framework/*`、`scaffold/`、`.qoder/repowiki/*`
- 本仓库在 Windows；shell 命令用 Git Bash 语法；git mv 前必须先停掉占用文件锁的 node 进程
- 每个 Task 结束都 commit；commit message 末尾带 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: 停止全部运行中的示例服务

Windows 下 node 进程会锁住 `node_modules` 内文件，不停服 `git mv` 会失败。当前会话可能有 4 个服务在跑（API:3001、user-crud admin:3000、erp-admin:5173、mall-mobile:3002），其中 3000/5173/3002 可能由 Claude Preview 工具管理。

**Files:** 无文件改动。

- [ ] **Step 1: 若有 Preview 管理的服务器，先停掉**

如果执行环境有 `preview_list` / `preview_stop` 工具：先 `preview_list` 列出所有 serverId，逐个 `preview_stop`。没有这些工具则跳过本步。

- [ ] **Step 2: 找出并杀掉监听目标端口的 node 进程**

```bash
netstat -ano | grep -E ":(3000|3001|3002|5173) " | grep LISTENING
```

对输出中每个 PID（最后一列）执行：

```bash
taskkill //F //T //PID <pid>
```

- [ ] **Step 3: 确认端口已全部释放**

```bash
netstat -ano | grep -E ":(3000|3001|3002|5173) " | grep LISTENING
```

Expected: 无输出（exit code 1 是正常的）。

---

### Task 2: 迁移 app/examples → examples 并修正 workspace 路径

**Files:**
- Move: `app/examples/` → `examples/`（整目录 git mv，node_modules 等未跟踪内容随文件系统 rename 一起走）
- Modify: `examples/user-crud/pnpm-workspace.yaml`
- Modify: `examples/admin/pnpm-workspace.yaml`

**Interfaces:**
- Produces: 根目录 `examples/{admin,api-extend,cache-crud,mq-memory-tests,user-crud}`；后续 Task 3/4 基于新路径。

- [ ] **Step 1: 执行迁移**

在仓库根目录：

```bash
git mv app/examples examples
```

- [ ] **Step 2: 确认迁移结果**

```bash
ls examples && ls app
```

Expected: `examples` 下有 admin、api-extend、cache-crud、mq-memory-tests、user-crud 五个目录；`app` 下只剩 `framework`（app/ 不为空，按 spec 保留）。

- [ ] **Step 3: 修正 examples/user-crud/pnpm-workspace.yaml**

原内容的 packages 三行改为（allowBuilds 段保持不变）：

```yaml
packages:
  - 'packages/*'
  - '../../packages/*'
  - '../../app/framework/*'
allowBuilds:
  '@swc/core': true
  better-sqlite3: true
  esbuild: true
  protobufjs: true
  sharp: true
```

- [ ] **Step 4: 修正 examples/admin/pnpm-workspace.yaml**

改为：

```yaml
packages:
  - '.'
  - '../../app/framework/*'
allowBuilds:
  esbuild: true
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move app/examples to top-level examples/

Part of the repo layout restructure (see docs/superpowers/specs/
2026-07-09-repo-layout-and-java-backend-skeleton-design.md).
Workspace relative paths adjusted for the new depth.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 更新全部旧路径引用

**Files:**
- Modify: `.claude/launch.json`
- Modify: `README.md:79`、`README.md:276`
- Modify: `docs/guide/api-development.md:824`
- Modify: `packages/aiko-boot-starter-cache/README.md:448`
- Modify: `.github/workflows/opencode.yml:353`、`:356`
- Modify: `.github/workflows/rules/pr-review-rules-admin.md:7`
- Modify: `.github/workflows/rules/pr-review-rules-mobile.md:7`

（行号为编写计划时的快照，若有漂移以 grep 结果为准。）

- [ ] **Step 1: .claude/launch.json — 三处路径**

把三条配置里 `"app/examples/user-crud/packages/admin"`、`"app/examples/admin"`、`"app/examples/user-crud/packages/mall-mobile"` 分别改为 `"examples/user-crud/packages/admin"`、`"examples/admin"`、`"examples/user-crud/packages/mall-mobile"`。

- [ ] **Step 2: README.md — 两处 cd 命令**

第 79 行与第 276 行：`cd app/examples/user-crud/packages/api` → `cd examples/user-crud/packages/api`。

- [ ] **Step 3: docs/guide/api-development.md — 链接文本和 URL**

第 824 行：

```markdown
> 完整示例代码见 [`examples/api-extend/`](https://github.com/ai-partner-x/aiko-boot/tree/main/examples/api-extend)。
```

- [ ] **Step 4: packages/aiko-boot-starter-cache/README.md — 链接文本和相对路径**

第 448 行中 `[`app/examples/cache-crud`](../../app/examples/cache-crud)` → `[`examples/cache-crud`](../../examples/cache-crud)`。

- [ ] **Step 5: .github/workflows/opencode.yml — 两处路径规则**

```
**管理后台（examples/admin/）：**
```

```
**移动端（examples/user-crud/packages/mall-mobile/）：**
```

（第二处顺带修正既有错误：`app/examples/mobile/` 这个路径从未存在过。）

- [ ] **Step 6: 两个 PR 审查规则文件**

`pr-review-rules-admin.md` 第 7 行：`- \`examples/admin/\` - 管理后台示例应用`
`pr-review-rules-mobile.md` 第 7 行：`- \`examples/user-crud/packages/mall-mobile/\` - 移动端示例应用`

- [ ] **Step 7: 全库校验无残留**

```bash
grep -rn "app/examples" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".qoder/" | grep -v "docs/superpowers/"
```

Expected: 无输出。（`.qoder/` 是第三方工具生成的快照按 spec 不动；`docs/superpowers/` 里的 spec/plan 以历史叙述提及旧路径，属正常。）

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: update all references from app/examples to examples/

Also fixes a pre-existing error: pr-review rules referenced
app/examples/mobile/ which never existed; corrected to the actual
mobile example path examples/user-crud/packages/mall-mobile/.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 重装依赖并回归验证 4 个示例服务

pnpm 在 Windows 上用 junction 链接 workspace 包（绝对路径），目录移动后必须重装；lockfile 里 importer 键是相对路径，也会随之更新。

**Files:**
- Modify（由 pnpm 生成）: `examples/user-crud/pnpm-lock.yaml`、`examples/admin/pnpm-lock.yaml`

- [ ] **Step 1: 重装 user-crud workspace**

```bash
cd examples/user-crud && pnpm install
```

Expected: 结尾 `Done in ...`，无 ERR。

- [ ] **Step 2: 重装 admin workspace**

```bash
cd ../admin && pnpm install
```

Expected: 同上。

- [ ] **Step 3: 启动 API 并验证**

回到仓库根目录，后台启动：

```bash
pnpm -C examples/user-crud/packages/api dev:server
```

等待约 8 秒后：

```bash
curl -s http://localhost:3001/api/users
```

Expected: `{"success":true,"data":[...]}` 且 data 数组包含 username 为 `admin` 的用户。

- [ ] **Step 4: 启动三个前端并逐个验证 HTTP 200**

分别后台启动：

```bash
pnpm -C examples/user-crud/packages/admin dev
pnpm -C examples/admin dev
pnpm -C examples/user-crud/packages/mall-mobile dev
```

等待约 10 秒后：

```bash
curl -s -o /dev/null -w "admin:%{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "erp:%{http_code}\n"   http://localhost:5173
curl -s http://localhost:3002 | grep -o "用户列表" | head -1
```

Expected: `admin:200`、`erp:200`、第三条输出 `用户列表`（mall-mobile 是 SSR，返回体直接含该文案，同时证明它连通了 3001 的 API）。

- [ ] **Step 5: 停掉刚才启动的 4 个服务**

```bash
netstat -ano | grep -E ":(3000|3001|3002|5173) " | grep LISTENING
```

对每个 PID：`taskkill //F //T //PID <pid>`，再次 netstat 确认无监听。

- [ ] **Step 6: Commit lockfile 变更**

```bash
git add -A
git commit -m "chore: refresh example lockfiles after directory move

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

（若 `git status` 显示无变更则跳过本步。）

---

### Task 5: 新建 frontend/ 与 mobile/ 占位目录

**Files:**
- Create: `frontend/README.md`
- Create: `mobile/README.md`

- [ ] **Step 1: frontend/README.md**

```markdown
# frontend/

前端组件库与 Web 应用的目标位置。

按仓库重组规划（`docs/superpowers/specs/2026-07-09-repo-layout-and-java-backend-skeleton-design.md`），
`app/framework/*`（admin-component / api-component / mall-component）将分批迁入此目录。
迁移完成前请勿在两处重复维护同一包。

- 管理后台、H5/响应式 Web 页面等 Web 形态的应用与组件都属于 frontend；
- 原生/跨端应用（Flutter 等）见 `mobile/`。
```

- [ ] **Step 2: mobile/README.md**

```markdown
# mobile/

原生 / 跨端移动应用（Flutter、React Native 等）的目标位置。

注意：基于 Web 技术的移动页面（如 `examples/user-crud/packages/mall-mobile`，Next.js H5）
属于 frontend 范畴，不放这里。本目录当前为占位，待首个原生应用立项后启用。
```

- [ ] **Step 3: Commit**

```bash
git add frontend/README.md mobile/README.md
git commit -m "chore: add frontend/ and mobile/ placeholder directories

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: backend/ 父 POM + 框架层 4 模块

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/aiko-boot-framework/pom.xml`
- Create: `backend/aiko-boot-framework/aiko-boot-core/pom.xml`
- Create: `backend/aiko-boot-framework/aiko-boot-starter-web/pom.xml`
- Create: `backend/aiko-boot-framework/aiko-boot-starter-orm/pom.xml`
- Create: `backend/aiko-boot-framework/aiko-boot-starter-cloud/pom.xml`
- Modify: `.gitignore`（追加 Java 构建产物）

**Interfaces:**
- Produces: 父 POM 坐标 `com.ai-partner-x:aiko-boot-backend:0.1.0-SNAPSHOT`；框架模块 `aiko-boot-core` 等 4 个 jar 坐标，Task 7 的 biz 模块将依赖 `aiko-boot-core`。

- [ ] **Step 1: backend/pom.xml（父 POM：聚合 + 版本仲裁）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ai-partner-x</groupId>
    <artifactId>aiko-boot-backend</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>Aiko Boot Backend</name>
    <description>Aiko Boot Java framework and platform services (Spring Boot / Spring Cloud)</description>

    <modules>
        <module>aiko-boot-framework</module>
        <!-- Task 7 会在此处追加 <module>aiko-boot-services</module> -->
    </modules>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>17</maven.compiler.release>
        <spring-boot.version>3.5.0</spring-boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>${spring-boot.version}</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

（`aiko-boot-services` 模块 Task 7 才创建，所以此时 `<modules>` 只列 framework，否则 validate 会因模块目录缺失而失败。）

- [ ] **Step 2: backend/aiko-boot-framework/pom.xml（框架层聚合）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>aiko-boot-backend</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>aiko-boot-framework</artifactId>
    <packaging>pom</packaging>
    <name>Aiko Boot Framework</name>

    <modules>
        <module>aiko-boot-core</module>
        <module>aiko-boot-starter-web</module>
        <module>aiko-boot-starter-orm</module>
        <module>aiko-boot-starter-cloud</module>
    </modules>
</project>
```

- [ ] **Step 3: 4 个框架模块 pom.xml**

四个文件结构完全一致，只有 artifactId / name / 职责注释不同。以 core 为例：

`backend/aiko-boot-framework/aiko-boot-core/pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>aiko-boot-framework</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <!-- 统一响应/异常码、租户上下文、合并部署规约、通用注解（详见 spec） -->
    <artifactId>aiko-boot-core</artifactId>
    <packaging>jar</packaging>
    <name>Aiko Boot Core</name>
</project>
```

其余三个把 `aiko-boot-core` / `Aiko Boot Core` 与注释替换为：

| 目录 | artifactId | name | 注释 |
|---|---|---|---|
| aiko-boot-starter-web | `aiko-boot-starter-web` | `Aiko Boot Starter Web` | 统一响应体自动包装、全局异常处理器、租户上下文 Filter、Jackson 统一配置 |
| aiko-boot-starter-orm | `aiko-boot-starter-orm` | `Aiko Boot Starter ORM` | MyBatis-Plus 统一配置：租户行级拦截器、分页、字段自动填充、逻辑删除 |
| aiko-boot-starter-cloud | `aiko-boot-starter-cloud` | `Aiko Boot Starter Cloud` | 跨服务租户/用户上下文透传 + 合并部署时 Feign 本地调用机制 |

每个模块另建空包占位：`src/main/java/com/aikoboot/<segment>/.gitkeep`，segment 分别为 `core`、`web`、`orm`、`cloud`。

- [ ] **Step 4: .gitignore 追加 Java 构建产物**

在根 `.gitignore` 末尾追加（若已有则跳过）：

```
# Java / Maven
backend/**/target/
```

- [ ] **Step 5: 验证**

```bash
mvn -f backend/pom.xml validate
```

Expected: 每个模块一行 SUCCESS，最后 `BUILD SUCCESS`。

- [ ] **Step 6: Commit**

```bash
git add backend .gitignore
git commit -m "feat(backend): add Maven parent POM and framework layer skeleton

Four framework modules per approved spec (core/web/orm/cloud);
cache and log starters were cut by the restraint principle.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: 基础服务模块（4 服务 × api/biz/starter + platform-bootstrap）

**Files:**
- Modify: `backend/pom.xml`（`<modules>` 加回 `<module>aiko-boot-services</module>`）
- Create: `backend/aiko-boot-services/pom.xml`
- Create: 4 服务 × 4 个 pom（服务聚合 + api + biz + starter）= 16 个 pom
- Create: 4 个 starter 的 `Application.java` + `application.yml`
- Create: `backend/aiko-boot-services/platform-bootstrap/pom.xml` + `Application.java` + `application.yml`

**Interfaces:**
- Consumes: Task 6 的 `aiko-boot-core`（biz 模块依赖它）与父 POM 版本仲裁。
- Produces: 各服务坐标 `com.ai-partner-x:service-<name>-{api,biz,starter}:0.1.0-SNAPSHOT`。

- [ ] **Step 1: 父 POM 加回 services 模块**

`backend/pom.xml` 的 `<modules>` 改为：

```xml
    <modules>
        <module>aiko-boot-framework</module>
        <module>aiko-boot-services</module>
    </modules>
```

- [ ] **Step 2: backend/aiko-boot-services/pom.xml（服务层聚合）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>aiko-boot-backend</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>aiko-boot-services</artifactId>
    <packaging>pom</packaging>
    <name>Aiko Boot Platform Services</name>

    <modules>
        <module>service-user</module>
        <module>service-auth</module>
        <module>service-permission</module>
        <module>service-message</module>
        <module>platform-bootstrap</module>
    </modules>
</project>
```

- [ ] **Step 3: service-user 完整四件套（其余三个服务照此替换参数）**

`backend/aiko-boot-services/service-user/pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>aiko-boot-services</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>service-user</artifactId>
    <packaging>pom</packaging>
    <name>Service User</name>

    <modules>
        <module>service-user-api</module>
        <module>service-user-biz</module>
        <module>service-user-starter</module>
    </modules>
</project>
```

`service-user/service-user-api/pom.xml`（对外契约，零依赖）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>service-user</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>service-user-api</artifactId>
    <packaging>jar</packaging>
    <name>Service User API</name>
</project>
```

占位：`service-user-api/src/main/java/com/aikoboot/user/api/.gitkeep`

`service-user/service-user-biz/pom.xml`（实现库，无 main）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>service-user</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>service-user-biz</artifactId>
    <packaging>jar</packaging>
    <name>Service User Biz</name>

    <dependencies>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-user-api</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>aiko-boot-core</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</project>
```

占位：`service-user-biz/src/main/java/com/aikoboot/user/.gitkeep`

`service-user/service-user-starter/pom.xml`（独立部署壳）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>service-user</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>service-user-starter</artifactId>
    <packaging>jar</packaging>
    <name>Service User Starter</name>

    <dependencies>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-user-biz</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

`service-user-starter/src/main/java/com/aikoboot/user/UserServiceApplication.java`：

```java
package com.aikoboot.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.aikoboot.user")
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

`service-user-starter/src/main/resources/application.yml`：

```yaml
spring:
  application:
    name: service-user
server:
  port: 9101
```

- [ ] **Step 4: 其余三个服务按下表替换参数（结构与 Step 3 完全一致）**

| 服务目录 | artifactId 前缀 | Java 包 | Application 类名 | scanBasePackages | port |
|---|---|---|---|---|---|
| service-auth | `service-auth-*` | `com.aikoboot.auth` | `AuthServiceApplication` | `com.aikoboot.auth` | 9102 |
| service-permission | `service-permission-*` | `com.aikoboot.permission` | `PermissionServiceApplication` | `com.aikoboot.permission` | 9103 |
| service-message | `service-message-*` | `com.aikoboot.message` | `MessageServiceApplication` | `com.aikoboot.message` | 9104 |

api 占位包分别为 `com/aikoboot/auth/api`、`com/aikoboot/permission/api`、`com/aikoboot/message/api`；biz 占位包为去掉 `/api` 的对应目录。`spring.application.name` 分别为 `service-auth`、`service-permission`、`service-message`。

- [ ] **Step 5: platform-bootstrap（合并部署壳）**

`backend/aiko-boot-services/platform-bootstrap/pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.ai-partner-x</groupId>
        <artifactId>aiko-boot-services</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>

    <artifactId>platform-bootstrap</artifactId>
    <packaging>jar</packaging>
    <name>Platform Bootstrap</name>
    <description>Combined-deployment shell: bundles selected *-biz modules into one process</description>

    <dependencies>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-user-biz</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-auth-biz</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-permission-biz</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>com.ai-partner-x</groupId>
            <artifactId>service-message-biz</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

`platform-bootstrap/src/main/java/com/aikoboot/platform/PlatformApplication.java`：

```java
package com.aikoboot.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 合并部署壳：扫描 com.aikoboot 下全部 biz 模块的组件，单进程启动。
 * 各服务的配置必须挂在自己的命名空间前缀下（合并部署规约，见 spec 必答清单第 2 条）。
 */
@SpringBootApplication(scanBasePackages = "com.aikoboot")
public class PlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
```

`platform-bootstrap/src/main/resources/application.yml`：

```yaml
spring:
  application:
    name: platform-bootstrap
server:
  port: 9100
```

- [ ] **Step 6: 全量构建验证**

```bash
mvn -f backend/pom.xml package -DskipTests
```

Expected: 全部模块 SUCCESS，`BUILD SUCCESS`（首次运行会下载依赖，耗时数分钟）。

- [ ] **Step 7: 冒烟一个独立部署壳**

后台启动：

```bash
mvn -f backend/pom.xml -pl aiko-boot-services/service-user/service-user-starter -am spring-boot:run
```

等待约 20 秒后：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9101/
```

Expected: `404`（Spring Boot 默认 404 说明 Web 容器已在 9101 正常监听；骨架无任何路由，404 即成功）。

然后停止：`netstat -ano | grep ":9101 " | grep LISTENING` 取 PID，`taskkill //F //T //PID <pid>`。

- [ ] **Step 8: Commit**

```bash
git add backend
git commit -m "feat(backend): add platform services skeleton (api/biz/starter split)

Four services (user/auth/permission/message) each split into api
(contract) / biz (implementation library) / starter (standalone
deployment shell), plus platform-bootstrap for combined deployment.
Skeleton only; module contents come with the Java framework spec.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 完成后

- 对照 spec 验收标准逐条打勾（frontend/mobile README、`mvn validate` 通过、`app/examples` 无残留、4 示例服务回归通过）。
- 提醒用户：下一步是 Java 框架细节 spec（以本 spec 的"必答清单"为输入），另开 brainstorming。
