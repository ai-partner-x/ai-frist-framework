import fs from 'fs-extra';

let cached: string | null = null;

/**
 * 获取脚手架生成时使用的 @ai-partner-x/* 依赖版本范围。
 *
 * 规则：
 * - 若设置了 AI_PARTNER_FRAMEWORK_VERSION，则优先使用（便于本地测试/回滚）。
 * - 否则默认使用当前 aiko-boot-cli 自身的版本号，并加上 ^，确保小版本/补丁版本兼容升级。
 */
export async function getFrameworkRegistryVersion(): Promise<string> {
  if (cached) return cached;

  const fromEnv = process.env.AI_PARTNER_FRAMEWORK_VERSION;
  if (fromEnv && typeof fromEnv === 'string') {
    cached = fromEnv;
    return fromEnv;
  }

  // dist/* 下运行时：package.json 一定在 dist/..（或 dist/**/../..）能被定位到
  // 这里从当前模块路径向上寻找 package.json，避免硬编码版本号。
  const candidateUrls = [
    new URL('../../package.json', import.meta.url),
    new URL('../package.json', import.meta.url),
    new URL('../../../package.json', import.meta.url),
  ];

  for (const url of candidateUrls) {
    try {
      const pkg = await fs.readJson(url);
      if (pkg?.version && typeof pkg.version === 'string') {
        cached = `^${pkg.version}`;
        return cached;
      }
    } catch {
      // ignore and try next
    }
  }

  // 最后兜底：避免脚手架中断（但强烈建议不要依赖这个兜底）
  cached = '^0.1.0';
  return cached;
}

