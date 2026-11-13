import { NextResponse, type NextRequest } from 'next/server';
import { apiOrigin } from './api/origin';

/** Legacy URLs whose behaviour now lives entirely in the API. */
const aliases: Record<string, string> = {
  '/logout': '/api/internal/logout',
  '/set.php': '/api/internal/account/upload-sort',
  '/robots.txt': '/api/robots.txt',
};

/**
 * Forwards API and media requests to the NestJS service. This runs per request (unlike next.config rewrites,
 * which are fixed at build time), so API_ORIGIN can differ between build and deployment.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL((aliases[pathname] ?? pathname) + search, apiOrigin));
}

export const config = {
  matcher: ['/api/:path*', '/uploads/cdn/:kind(img|pages|video)/:filename', '/logout', '/set.php', '/robots.txt'],
};
