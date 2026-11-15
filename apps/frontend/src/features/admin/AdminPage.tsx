import type { ReactNode } from 'react';
import type { Viewer } from '@nativegallery/contracts';
import { forbidden, notFound, redirect } from 'next/navigation';
import { apiFetch } from '../../api/client';
import { siteContext } from '../site/SiteContext';
import { can, type AdminRole } from './lib/roles';

/** Checks the viewer's admin level for a section, then renders it (titles come from the route's generateMetadata). */
export async function AdminPage(role: AdminRole, load: (viewer: Viewer) => Promise<ReactNode>) {
  const { viewer } = await siteContext();
  if (!viewer) redirect('/login');
  if (!viewer.admin) forbidden();
  // Photo moderators only ever see the moderation queue, as in the PHP admin.
  if (!can(viewer.admin, role)) viewer.admin === 2 ? redirect('/admin?type=Photo') : forbidden();
  return load(viewer);
}

/** JSON from an admin endpoint with the viewer's session; API statuses become the matching Next pages. */
export async function adminData<T>(path: string): Promise<T> {
  const response = await apiFetch(path, { auth: true });
  if (response?.status === 403) forbidden();
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Не удалось загрузить данные (' + path + ')');
  return response.json() as Promise<T>;
}
