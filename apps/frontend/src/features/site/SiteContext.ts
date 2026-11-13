import { cache } from 'react';
import { headers } from 'next/headers';
import type { Viewer } from '@nativegallery/contracts';

export const siteContext = cache(async () => {
  const cookie = (await headers()).get('cookie');
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: cookie ?? '' }, cache: 'no-store',
  }).catch(() => null);
  const context: { viewer: Viewer | null; databaseVersion: string } = response?.ok
    ? await response.json() : { viewer: null, databaseVersion: '' };
  return { ...context, cookie };
});
