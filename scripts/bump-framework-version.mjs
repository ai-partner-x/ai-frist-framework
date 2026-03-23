import path from 'path';
import fs from 'fs-extra';

/**
 * 用法：
 *   node ./scripts/bump-framework-version.mjs --version 0.1.4
 *
 * 作用：
 * - 扫描仓库根目录下 packages/（每个子目录的 package.json）
 * - 对 name 以 @ai-partner-x/ 开头且非 private 的包，统一写入新版本号
 *
 * 设计目标：
 * - 发布前只需要改“一个输入版本号”，不再逐个手动改多个 package.json
 */

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, 'packages');
const FRAMEWORK_SCOPE = '@ai-partner-x/';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') continue;
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) out[k] = true;
    else {
      out[k] = v;
      i++;
    }
  }
  return out;
}

function assertSemver(version) {
  // 轻量校验：x.y.z
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`version 格式不正确，应为 x.y.z，实际为: ${version}`);
  }
}

const args = parseArgs(process.argv.slice(2));
const nextVersion = args.version;
if (!nextVersion || typeof nextVersion !== 'string') {
  console.error('缺少参数：--version <x.y.z>');
  process.exit(1);
}
assertSemver(nextVersion);

if (!(await fs.pathExists(PACKAGES_DIR))) {
  console.error(`未找到目录: ${PACKAGES_DIR}`);
  process.exit(1);
}

const dirs = await fs.readdir(PACKAGES_DIR);
let changedCount = 0;
let scannedCount = 0;

for (const dir of dirs) {
  const pkgPath = path.join(PACKAGES_DIR, dir, 'package.json');
  if (!(await fs.pathExists(pkgPath))) continue;

  scannedCount++;
  const pkg = await fs.readJson(pkgPath);

  const name = pkg?.name;
  const isFrameworkPkg = typeof name === 'string' && name.startsWith(FRAMEWORK_SCOPE);
  const isPrivate = pkg?.private === true;

  if (!isFrameworkPkg) continue;
  if (isPrivate) continue;

  if (pkg.version !== nextVersion) {
    pkg.version = nextVersion;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    changedCount++;
  }
}

console.log(
  `完成：扫描 ${scannedCount} 个包目录，更新 ${changedCount} 个 @ai-partner-x/* 包版本为 ${nextVersion}`,
);

