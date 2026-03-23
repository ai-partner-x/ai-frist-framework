# `aiko-boot` 命令行工具

> 本文是原 `aiko-boot-create` 文档的更新版：**CLI 包名已更名为 `@ai-partner-x/aiko-boot-cli`**。

`@ai-partner-x/aiko-boot-cli` 是 Aiko Boot 的脚手架 CLI，用来 **创建一个新的 monorepo**，并在已有脚手架中 **增量添加 app/api/feature**。

## 安装与运行

> 推荐用 `pnpm dlx` 或 `npx` 运行，避免全局安装污染。

```bash
# 方式 1：临时执行（推荐）
pnpm dlx @ai-partner-x/aiko-boot-cli@latest --help

# 方式 2：npx
npx @ai-partner-x/aiko-boot-cli@latest --help

# 方式 3：安装后使用 bin（包内定义的 bin 名为 aiko-boot）
pnpm add -D @ai-partner-x/aiko-boot-cli
pnpm aiko-boot --help

# 或者（安装到全局）
pnpm add -g @ai-partner-x/aiko-boot-cli
aiko-boot --help
```

## 命令总览

- **`create`**：创建新的脚手架 monorepo（可选生成 api/admin/mobile）
- **`add-app`**：在现有脚手架中新增前端应用（admin / mobile）
- **`add-api`**：在现有脚手架中新增后端服务（api）
- **`add-feature`**：给某个服务端增加特性（redis / file / mq / log）
- **`list`**：查看当前脚手架配置（apps / apis / features）

> 脚手架根目录通过 `.aiko-boot.json` 识别；多数“增量命令”要求在脚手架根目录执行，或用 `--root` 显式指定。

## 生成的项目结构

`create` 生成的工程是一个 pnpm monorepo：

```
my-app/
  package.json
  pnpm-workspace.yaml
  .aiko-boot.json
  packages/
    api/            # 可选：后端服务（Aiko Boot）
    admin/          # 可选：管理端
    mobile/         # 可选：移动端
    core/           # 可选：共享 core（前端鉴权等）
```

### `.aiko-boot.json`（脚手架配置）

CLI 用该文件记录脚手架状态，`list/add-feature` 等命令会读取/更新它：

- **`scope`**：生成包名的 scope（如 `@my-app/*`）
- **`apps`**：前端应用列表（`name/type/path`）
- **`apis`**：后端服务列表（`name/db/path/features[]`）

## 最佳实践：创建工程与运行时配置（端口 / 环境变量）

脚手架的职责边界是：

- `.aiko-boot.json` 记录 **工程清单**（有哪些 app/api、它们的 path/features），用于生成/同步根目录脚本与后续增量命令
- **端口、域名、回调地址等属于运行时配置**，应当放在 **各服务自己的配置文件** 或 **环境变量** 中（便于 dev/stage/prod 切换与部署平台接管）

下面按“创建 → 启动 → 配置”的顺序给出一套可直接照做的操作说明。

### 1）创建一个包含 api/admin/mobile 的脚手架

```bash
aiko-boot create my-app --with-api --with-admin --with-mobile
cd my-app
pnpm install
```

也可以先空工程，再增量添加：

```bash
aiko-boot create my-app --empty
cd my-app

# 添加后端服务
aiko-boot add-api api --db sqlite

# 添加前端应用（开发阶段若使用仓库内模板，需指定 --template-dir）
aiko-boot add-app admin -t admin --template-dir scaffold
aiko-boot add-app mobile -t mobile --template-dir scaffold
```

### 2）启动方式（推荐在根目录用 pnpm scripts）

CLI 会根据 `.aiko-boot.json` 同步根目录 `package.json` scripts（如 `dev/build/lint` 以及 `dev:api/dev:admin/dev:mobile`）。

常用命令：

```bash
# 并行启动所有 @<scope>/* 包的 dev
pnpm dev

# 只启动 api / admin / mobile（如果存在）
pnpm dev:api
pnpm dev:admin
pnpm dev:mobile
```

### 3）后端（API）端口怎么配置？

后端端口位于服务自身的 `app.config.ts`，并支持用环境变量覆盖（推荐）。

- **默认配置文件**：`packages/<api>/app.config.ts`
- **默认端口 key**：`server.port`
- **环境变量覆盖**：`PORT`

示例（以 `packages/api` 为例）：

```bash
# 使用默认端口（模板默认 3001）
pnpm dev:api

# 临时改端口（推荐做法：运行时注入）
PORT=3005 pnpm dev:api
```

如果你新增了多个 API（例如 `user-api`），同样用 `PORT` 注入即可：

```bash
# 例如 scope=my-app 时
PORT=3011 pnpm -F @my-app/user-api dev
```

### 4）前端（admin/mobile）端口怎么配置？

前端使用 Vite，端口是 dev server 的运行参数，推荐放在各自的 `vite.config.ts`：

- `packages/admin/vite.config.ts` → `server.port`（模板默认 4200）
- `packages/mobile/vite.config.ts` → `server.port`（模板默认 3002）

也可以在 `package.json` 的 `dev` 脚本里通过 `vite --port <n>` 指定，但建议 **二选一**（避免配置重复）。

### 5）前后端联调：API Base URL / Proxy 怎么配置？

两种推荐方式，选一种即可：

- **方式 A（推荐）**：前端通过环境变量配置 API 地址
  - `VITE_API_URL=http://localhost:3001`
  - admin/mobile 读取 `import.meta.env.VITE_API_URL`

示例：

```bash
# 在 admin 中（示例）
VITE_API_URL=http://localhost:3001 pnpm dev:admin
```

- **方式 B**：通过 dev server proxy 转发 `/api`
  - 适用于“前端只请求相对路径 `/api`，由 Vite 转发到后端”的习惯
  - 需要在 `packages/admin/vite.config.ts` 的 `server.proxy['/api'].target` 指向后端地址（如 `http://localhost:3001`）

> 注意：如果你同时修改了 API 端口（例如 `PORT=3005`），也要同步更新 `VITE_API_URL` 或 proxy target。
