import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.method === 'POST' && request.nextUrl.pathname === '/lk/profile' && request.nextUrl.searchParams.get('type') === 'Personalization') {
    return NextResponse.rewrite(new URL('/lk/profile/theme', request.url));
  }
  if (request.method === 'POST' && request.nextUrl.pathname === '/vehicle/dbedit') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/vehicle/submit-request';
    return NextResponse.rewrite(destination);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/lk/profile', '/vehicle/dbedit'] };
