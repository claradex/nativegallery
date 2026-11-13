import { AdminInteractions, type AdminSection } from './AdminInteractions';
import type { ReactNode } from 'react';
import { forbidden, redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';
import { AdminSidebar } from './AdminSidebar';

export async function AdminPage(title: string, section: AdminSection | null,
  load: (options: RequestInit) => Promise<ReactNode>) {
  const { viewer, cookie } = await siteContext();
  if (!viewer) redirect('/login');
  if (viewer.admin === 2 && section !== 'AdminPhotos') redirect('/admin?type=Photo');
  if (!viewer.admin) forbidden();
  const content = await load({ headers: { cookie: cookie ?? '' }, cache: 'no-store' });
  if (!content) throw new Error('Could not load admin data');
  return <>
    <title>{title}</title>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" defer />
    <div className="container">
      <AdminSidebar title={process.env.SITE_TITLE ?? 'NativeGallery'} pending={viewer.pendingPhotos} />
      {content}
      {section && <AdminInteractions section={section} />}
    </div>
  </>;
}
