import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@user-crud/api',
    '@ai-partner-x/aiko-boot-starter-web',
    '@ai-partner-x/aiko-boot',
    '@ai-partner-x/core',
    '@ai-partner-x/aiko-boot-starter-orm',
    '@ai-partner-x/aiko-boot-starter-validation',
  ],
};

export default nextConfig;
