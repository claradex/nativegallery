import { NextResponse, type NextRequest } from 'next/server';
import { apiOrigin } from './api/origin';

/** Legacy URLs whose behaviour now lives entirely in the API. */
const aliases: Record<string, string> = {
  '/logout': '/api/internal/logout',
  '/set.php': '/api/internal/account/upload-sort',
  '/robots.txt': '/api/robots.txt',
};

const apiPath = /^\/(?:api\/|uploads\/cdn\/(?:img|pages|video)\/[^/]+$)/;

/**
 * Forwards API and media requests to the NestJS service and switches the whole site to the maintenance page.
 * This runs per request (unlike next.config rewrites, which are fixed at build time), so API_ORIGIN and
 * MAINTENANCE can be changed without rebuilding.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (process.env.MAINTENANCE === 'true') {
    return NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503, headers: { 'Retry-After': '3600' } });
  }
  if (pathname === '/maintenance') return NextResponse.rewrite(new URL('/not-found-page', request.url));
  if (aliases[pathname] || apiPath.test(pathname)) {
    return NextResponse.rewrite(new URL((aliases[pathname] ?? pathname) + search, apiOrigin));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/|static/|favicon\\.ico).*)'] };
