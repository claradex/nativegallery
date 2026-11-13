export async function GET(request: Request) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/logout', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store', redirect: 'manual',
  }).catch(() => null);
  if (response?.status !== 302) return new Response('Service Unavailable', { status: 503 });
  const headers = new Headers({ Location: '/', 'Cache-Control': 'private, no-store' });
  for (const cookie of response.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 302, headers });
}
