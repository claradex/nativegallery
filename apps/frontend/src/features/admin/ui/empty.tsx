import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

/** Shown instead of an empty list: says what would be here and how to add it. */
export function Empty({ icon: Icon, title, children, action, className }: {
  icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode; className?: string;
}) {
  return <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
    <div className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-5" /></div>
    <div className="grid gap-1">
      <p className="font-medium">{title}</p>
      {children && <p className="max-w-sm text-sm text-muted-foreground">{children}</p>}
    </div>
    {action}
  </div>;
}
