import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { authInterrupts: true },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
    return {
      beforeFiles: [
        ...['/comments', '/comments.php'].map(source => ({
          source, has: [{ type: 'query' as const, key: 'ajax', value: '1' }], destination: '/comments/fragment',
        })),
        { source: '/api/photo/getcomments/:id', destination: '/photo-comments-fragment/:id' },
        { source: '/api/:path*', destination: apiOrigin + '/api/:path*' },
        { source: '/uploads/cdn/img/:filename', destination: apiOrigin + '/uploads/cdn/img/:filename' },
        { source: '/uploads/cdn/pages/:filename', destination: apiOrigin + '/uploads/cdn/pages/:filename' },
        { source: '/uploads/cdn/video/:filename', destination: apiOrigin + '/uploads/cdn/video/:filename' },
      ],
    };
  },
};

export default config;
