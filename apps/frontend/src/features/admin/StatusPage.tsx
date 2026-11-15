import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function StatusPage({ icon: Icon, title, children, actions }: { icon: LucideIcon; title: string; children: ReactNode; actions?: ReactNode }) {
  return <div className="grid min-h-[60dvh] place-items-center px-4 py-16">
    <div className="max-w-md text-center">
      <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-6" /></div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  </div>;
}
