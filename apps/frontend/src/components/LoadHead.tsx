import '@fortawesome/fontawesome-free/css/all.min.css';
import 'boxicons/css/boxicons.min.css';
import '../styles/site/style.css';
import '../styles/site/desktop.css';
import '../styles/site/trans.css';
import '../styles/site/photo.css';
import '../styles/site/notie.css';
import '../styles/site/comments.css';
import '../styles/site/map.css';
import '../styles/site/progress.css';
import '../styles/themes/nativegallery-dark.css';
import type { Metadata, Viewport } from 'next';
import { readCookie } from '../api/client';

const themes = new Set(['nativegallery-dark']);

/** The theme stylesheets are scoped to `html[data-theme=…]`, so the cookie only has to pick the attribute. */
export function siteTheme(cookie: string) {
  const theme = readCookie(cookie, 'NGALLERYTHEME');
  return theme && themes.has(theme) ? theme : undefined;
}

export function generateMetadata(): Metadata {
  return { title: process.env.SITE_TITLE ?? 'NativeGallery' };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export function ProgressBar() {
  return <div className="progress-container fixed-top"><span className="progress-bard"></span></div>;
}
