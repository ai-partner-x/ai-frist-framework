import path from 'path';
import fs from 'fs-extra';
import {
  loadProjectConfig,
  saveProjectConfig,
  type AikoProjectConfig,
} from './project-config.js';
import { getFrameworkRegistryVersion } from './framework-version.js';

const FRAMEWORK_SCOPE = '@ai-partner-x/';

export async function ensurePnpmWorkspace(rootDir: string): Promise<void> {
  const workspacePath = path.join(rootDir, 'pnpm-workspace.yaml');
  if (await fs.pathExists(workspacePath)) return;

  await fs.writeFile(
    workspacePath,
    `packages:
  - 'packages/*'
`,
    'utf-8',
  );
}

export async function withProjectConfig(
  rootDir: string,
  updater: (config: AikoProjectConfig) => AikoProjectConfig | void,
): Promise<AikoProjectConfig> {
  const existing = (await loadProjectConfig(rootDir)) ?? {
    version: 1,
    apps: [],
    apis: [],
  };
  const next = (updater(existing) ?? existing) as AikoProjectConfig;
  await saveProjectConfig(rootDir, next);
  return next;
}

/**
 * 根据 .aiko-boot.json 的配置，同步根目录下的 package.json：
 * - 补充 name/version/private
 * - 生成常用 scripts（dev / build / lint / dev:api 等）
 * - 便于后续在根目录直接运行 pnpm 脚本
 */
export async function syncRootPackageJson(rootDir: string): Promise<void> {
  const config = await loadProjectConfig(rootDir);
  if (!config) return;

  const rootPkgPath = path.join(rootDir, 'package.json');
  let pkg: any = {};

  if (await fs.pathExists(rootPkgPath)) {
    pkg = await fs.readJson(rootPkgPath);
  }

  const scope = config.scope ?? 'scaffold';

  if (!pkg.name) {
    pkg.name = `${scope}-monorepo`;
  }
  if (pkg.private === undefined) {
    pkg.private = true;
  }
  if (!pkg.version) {
    pkg.version = '0.1.0';
  }

  const scripts: Record<string, string> = pkg.scripts ?? {};

  // 通用脚本：对所有 @<scope>/* 包执行 dev / build / lint
  scripts.dev = `pnpm -r --parallel --filter "@${scope}/*" dev`;
  scripts.build = `pnpm -r --filter "@${scope}/*" build`;
  scripts.lint = `pnpm -r --filter "@${scope}/*" lint`;

  // API 相关脚本：只针对 name === 'api' 的服务，保持与 scaffold 模板一致
  const api = (config.apis ?? []).find((x) => x.name === 'api');
  if (api) {
    const apiPkgName = `@${scope}/${api.name}`;
    scripts['dev:api'] = `pnpm -F ${apiPkgName} dev`;
    scripts['build:api'] = `pnpm -F ${apiPkgName} build`;
    scripts['start:api'] = `pnpm -F ${apiPkgName} start`;
    scripts['init-db'] = `pnpm -F ${apiPkgName} init-db`;
  }

  // Admin / Mobile 应用脚本：按照 type 分类
  const apps = config.apps ?? [];
  const adminApp = apps.find((x) => x.type === 'admin');
  if (adminApp) {
    const adminPkgName = `@${scope}/${adminApp.name}`;
    scripts['dev:admin'] = `pnpm -F ${adminPkgName} dev`;
    scripts['build:admin'] = `pnpm -F ${adminPkgName} build`;
  }
  const mobileApp = apps.find((x) => x.type === 'mobile');
  if (mobileApp) {
    const mobilePkgName = `@${scope}/${mobileApp.name}`;
    scripts['dev:mobile'] = `pnpm -F ${mobilePkgName} dev`;
    scripts['build:mobile'] = `pnpm -F ${mobilePkgName} build`;
  }

  pkg.scripts = scripts;

  // 与 scaffold-default 对齐：只在未设置时提供默认值
  const pnpmConfig = pkg.pnpm ?? {};
  if (!pnpmConfig.onlyBuiltDependencies) {
    pnpmConfig.onlyBuiltDependencies = ['better-sqlite3'];
  }

  // 清理旧的本地框架覆盖（如 file:.../packages/），避免在中央仓库安装时仍引用本地库。
  if (pnpmConfig.overrides && typeof pnpmConfig.overrides === 'object') {
    for (const [k, v] of Object.entries(pnpmConfig.overrides)) {
      if (k.startsWith(FRAMEWORK_SCOPE) && typeof v === 'string' && v.startsWith('file:')) {
        delete (pnpmConfig.overrides as any)[k];
      }
    }
    if (Object.keys(pnpmConfig.overrides).length === 0) {
      delete (pkg.pnpm as any).overrides;
    }
  }

  pkg.pnpm = pnpmConfig;

  // Ensure all generated framework deps use registry versions (not `workspace:*`),
  // so the scaffold can be used outside of this monorepo.
  await replaceFrameworkDepsWithRegistryVersion(rootDir);

  await fs.writeJson(rootPkgPath, pkg, { spaces: 2 });
}

async function replaceFrameworkDepsWithRegistryVersion(
  rootDir: string,
): Promise<void> {
  const FRAMEWORK_REGISTRY_VERSION = await getFrameworkRegistryVersion();
  const packageJsonPaths: string[] = [];

  async function collect(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.name === 'node_modules') continue;
      if (e.isDirectory()) {
        if (e.name.startsWith('.')) continue;
        await collect(full);
      } else if (e.isFile() && e.name === 'package.json') {
        packageJsonPaths.push(full);
      }
    }
  }

  await collect(path.join(rootDir, 'packages'));

  for (const pkgPath of packageJsonPaths) {
    const pkg = await fs.readJson(pkgPath);
    let changed = false;

    for (const key of ['dependencies', 'devDependencies'] as const) {
      if (!pkg[key]) continue;
      for (const [name, value] of Object.entries(pkg[key] as Record<
        string,
        unknown
      >)) {
        if (!name.startsWith(FRAMEWORK_SCOPE)) continue;
        if (typeof value !== 'string') continue;
        if (value.startsWith('file:') || value.startsWith('link:')) continue;
        (pkg[key] as Record<string, string>)[name] = FRAMEWORK_REGISTRY_VERSION;
        changed = true;
      }
    }

    if (changed) {
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }
  }
}
