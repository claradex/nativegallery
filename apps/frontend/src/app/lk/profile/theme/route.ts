export async function POST(request: Request) {
  const url = new URL(request.url);
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const viewer = await fetch(api + '/api/profile/settings', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (viewer?.status === 403) return Response.redirect(new URL('/login', url), 303);
  if (!viewer?.ok) return new Response('Service Unavailable', { status: 503 });
  const form = await request.formData().catch(() => null);
  const theme = form?.get('theme_id');
  if (theme !== 'standard' && theme !== 'nativegallery-dark') return new Response(null, { status: 400 });
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  return new Response(null, { status: 303, headers: {
    Location: '/lk/profile?type=Personalization',
    'Set-Cookie': 'NGALLERYTHEME=' + theme + '; Path=/; HttpOnly; SameSite=Lax' + secure,
    'Cache-Control': 'private, no-store',
  } });
}
