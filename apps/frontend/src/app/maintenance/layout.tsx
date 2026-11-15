import type { ReactNode } from 'react';
import { setting } from '@nativegallery/config';

// Rendered per request, so the title follows the settings file instead of the value at build time.
export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return { title: setting('SITE_TITLE'), robots: { index: false } };
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body style={{ backgroundColor: 'black', margin: 0 }}>{children}</body></html>;
}
