export async function POST(request: Request) {
  const id = new URL(request.url).searchParams.get('type');
  const headers = { 'Cache-Control': 'private, no-store' };
  if (!id || !/^\d{1,10}$/.test(id)) return new Response(null, { status: 404, headers });
  const fields = await request.formData().catch(() => null);
  if (!fields) return new Response(null, { status: 400, headers });

  const body = new URLSearchParams();
  for (const [key, value] of fields) {
    if (typeof value === 'string') body.append(key, value);
  }
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const result = await fetch(api + '/api/vehicles/requests/' + id, {
    method: 'POST', body, cache: 'no-store', headers: { cookie: request.headers.get('cookie') ?? '' },
  }).catch(() => null);
  if (!result) return new Response(null, { status: 503, headers });
  if (!result.ok) return new Response(null, { status: result.status, headers });
  return new Response('Заявка на рассмотрение успешно отправлена', {
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
