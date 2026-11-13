import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.method === 'POST' && request.nextUrl.searchParams.get('type') === 'Personalization') {
    return NextResponse.rewrite(new URL('/lk/profile/theme', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: '/lk/profile' };
