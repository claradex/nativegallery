import type { Metadata } from 'next';
import { NotFound } from '../features/site/NotFound';
import { interFont } from '../styles/fonts';

export const metadata: Metadata = { title: 'Server Error', robots: { index: false } };

export default function GlobalNotFound() {
  return <html lang="en"><body className={interFont.className}><NotFound /></body></html>;
}
