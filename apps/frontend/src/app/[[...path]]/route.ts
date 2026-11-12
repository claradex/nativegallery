import { Document, type PageContext } from '../../components/Document';
import { Login } from '../../features/auth/Login';
import { Rules } from '../../features/rules/Rules';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, route: { params: Promise<{ path?: string[] }> }) {
  const path = (await route.params).path?.join('/') ?? '';
  const login = path === 'login';
  const markup = login ? Login() : Rules(path);
  if (!markup) return new Response('Not Found', { status: 404 });
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const context: PageContext = await response.json();
  if (login && context.viewer) return Response.redirect(new URL('/', request.url), 302);
  return Document(request, markup, context);
}
