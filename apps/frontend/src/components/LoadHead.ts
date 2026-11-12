import { readTemplate } from './ReadTemplate';
import { escapeHtml } from './Html';

const markup = readTemplate('src/components/LoadHead.html');

export function LoadHead(title: string) {
  const cache = process.env.CLOUDFLARE_CACHING === 'true' ? '?' + Math.floor(Date.now() / 1000) : '';
  return markup.replaceAll(/__(TITLE|CACHE|THEME)__/g, (_, field) => field === 'TITLE' ? escapeHtml(title) : field === 'CACHE' ? cache : '');
}
