import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><head>
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/static/css/header.admin.css" />
    <link rel="stylesheet" href="/static/css/tabs.css" />
    <style>{'body{font-family:Inter!important}'}</style>
  </head><body>{children}</body></html>;
}
