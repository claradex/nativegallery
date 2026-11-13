import type { ReactNode } from 'react';

export const metadata = { title: process.env.SITE_TITLE ?? 'NativeGallery', robots: { index: false } };

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body style={{ backgroundColor: 'black', margin: 0 }}>{children}</body></html>;
}
