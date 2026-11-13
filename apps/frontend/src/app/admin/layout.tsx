import 'bootstrap/dist/css/bootstrap.min.css';
import 'boxicons/css/boxicons.min.css';
import '../../styles/admin/header.css';
import '../../styles/admin/tabs.css';
import type { ReactNode } from 'react';
import { interFont } from '../../styles/fonts';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body className={interFont.className}>{children}</body></html>;
}
