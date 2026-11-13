import type { ReactNode } from 'react';
import { SiteLayout } from '../../components/SiteLayout';

export default function PhotoLayout({ children }: { children: ReactNode }) {
  return <SiteLayout photo>{children}</SiteLayout>;
}
