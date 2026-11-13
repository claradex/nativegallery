import { readTemplate } from './ReadTemplate';
import { escapeHtml } from './Html';

const markup = readTemplate('src/components/LoadHead.html');

export function LoadHead(title: string, cookie: string | null = null) {
  const cache = process.env.CLOUDFLARE_CACHING === 'true' ? '?' + Math.floor(Date.now() / 1000) : '';
  const theme = /(?:^|;\s*)NGALLERYTHEME=nativegallery-dark(?:;|$)/.test(cookie ?? '')
    ? '<link rel="stylesheet" href="/static/themepacks/nativegallery-dark/root.css">' : '';
  return markup.replaceAll(/__(TITLE|CACHE|THEME)__/g, (_, field) => field === 'TITLE' ? escapeHtml(title) : field === 'CACHE' ? cache : theme);
}
