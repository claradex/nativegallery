import { cache } from 'react';
import type { Viewer } from '@nativegallery/contracts';
import { apiFetch, requestCookie } from '../../api/client';

export const siteContext = cache(async () => {
  const [response, cookie] = await Promise.all([apiFetch('/api/internal/viewer', { auth: true }), requestCookie()]);
  const context: { viewer: Viewer | null; databaseVersion: string } = response?.ok
    ? await response.json() : { viewer: null, databaseVersion: '' };
  return { ...context, cookie };
});
