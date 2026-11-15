import { Suspense, type ReactNode } from 'react';
import { AdminSidebar, type SidebarProps } from './AdminSidebar';

export function AdminShell({ children, ...sidebar }: SidebarProps & { children: ReactNode }) {
  return <div className="min-h-dvh">
    <Suspense fallback={<div className="h-14 bg-sidebar lg:hidden" />}><AdminSidebar {...sidebar} /></Suspense>
    <div className="lg:pl-64">
      <main id="admin-main" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
    </div>
  </div>;
}
