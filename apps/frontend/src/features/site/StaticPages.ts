import { escapeHtml } from '../../components/Html';
import { readTemplate } from '../../components/ReadTemplate';

export function Tour() {
  return readTemplate('src/features/site/Tour.html').replace('__TITLE__',
    () => escapeHtml(process.env.SITE_TITLE ?? 'NativeGallery'));
}

export function NotFound(request: Request) {
  const url = new URL(request.url);
  const html = readTemplate('src/features/site/NotFound.html').replace('__REQUEST_URI__',
    () => escapeHtml(url.pathname + url.search));
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
