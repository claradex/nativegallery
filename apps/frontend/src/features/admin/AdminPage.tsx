import { AdminBootstrap, AdminInteractions, type AdminSection } from './AdminInteractions';
import type { ReactNode } from 'react';
import { forbidden, redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';
import { AdminSidebar } from './AdminSidebar';

export async function AdminPage(title: string, section: AdminSection | null,
  load: () => Promise<ReactNode>) {
  const { viewer } = await siteContext();
  if (!viewer) redirect('/login');
  if (viewer.admin === 2 && section !== 'AdminPhotos') redirect('/admin?type=Photo');
  if (!viewer.admin) forbidden();
  const content = await load();
  if (!content) throw new Error('Could not load admin data');
  return <>
    <title>{title}</title>
    <AdminBootstrap />
    <div className="container">
      <AdminSidebar title={process.env.SITE_TITLE ?? 'NativeGallery'} pending={viewer.pendingPhotos} />
      {content}
      {section && <AdminInteractions section={section} />}
    </div>
  </>;
}
