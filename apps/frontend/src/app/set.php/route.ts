export function GET(request: Request) {
  const sort = new URL(request.url).searchParams.get('lk_upl_sort');
  if (sort !== '0' && sort !== '1' && sort !== '2') return new Response(null, { status: 400 });
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  return new Response(null, { status: 302, headers: {
    Location: '/lk/history',
    'Set-Cookie': 'lk_upl_sort=' + sort + '; Path=/lk; HttpOnly; SameSite=Lax' + secure,
    'Cache-Control': 'private, no-store',
  } });
}
