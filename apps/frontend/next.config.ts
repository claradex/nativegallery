import type { NextConfig } from 'next';

/** Old PHP page addresses served by their clean App Router pages. API traffic is forwarded by src/proxy.ts. */
const legacyPages: Record<string, string> = {
  '/authors.php': '/authors',
  '/comments.php': '/comments',
  '/news2.php': '/news',
  '/search.php': '/search',
  '/update.php': '/update',
  '/voting.php': '/voting',
};

const config: NextConfig = {
  experimental: { authInterrupts: true, globalNotFound: true },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return { beforeFiles: Object.entries(legacyPages).map(([source, destination]) => ({ source, destination })) };
  },
};

export default config;
