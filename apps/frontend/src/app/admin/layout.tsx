import '../../styles/admin/admin.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClientNavigation } from '../../components/ClientNavigation';
import { apiFetch } from '../../api/client';
import { interFont } from '../../styles/fonts';
import { siteContext } from '../../features/site/SiteContext';
import { AdminShell } from '../../features/admin/AdminShell';
import { Toaster } from '../../features/admin/ui/toaster';
import { setting } from '@nativegallery/config';

export const metadata: Metadata = { title: 'Панель управления', robots: { index: false, follow: false } };

async function counts(pendingPhotos: number) {
  const response = await apiFetch('/api/admin/models/summary', { auth: true });
  const summary: { pendingPhotos: number; pendingRequests: number } | null = response?.ok ? await response.json() : null;
  return summary ?? { pendingPhotos, pendingRequests: 0 };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { viewer } = await siteContext();
  const title = setting('SITE_TITLE');
  return <html lang="ru" className={interFont.variable}>
    <body>
      <div className="progress-bard" aria-hidden />
      <ClientNavigation />
      {viewer?.admin
        ? <AdminShell title={title} viewer={viewer} counts={await counts(viewer.pendingPhotos)}>{children}</AdminShell>
        : children}
      <Toaster />
    </body>
  </html>;
}
