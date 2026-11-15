import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from '../../components/Link';

export function PageHeader({ title, description, actions, back }: {
  title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string };
}) {
  return <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div className="min-w-0">
      {back && <Link href={back.href} className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />{back.label}
      </Link>}
      <h1 className="text-2xl leading-tight font-semibold tracking-[-0.015em] text-balance sm:text-[28px]">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>;
}

/** Sub-pages of a section as links, so each tab has its own address and survives a reload. */
export function SectionTabs({ tabs }: { tabs: { href: string; label: string; active: boolean; count?: number }[] }) {
  return <nav aria-label="Вкладки" className="-mx-4 mb-6 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
    <ul className="flex gap-5">{tabs.map(tab => <li key={tab.href}>
      <Link href={tab.href} aria-current={tab.active ? 'page' : undefined}
        className={'relative flex h-10 items-center gap-2 text-sm whitespace-nowrap transition-colors ' +
          (tab.active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>
        {tab.label}
        {tab.count !== undefined && tab.count > 0 && <span className={'rounded-full px-1.5 text-[11px] font-semibold tabular-nums ' +
          (tab.active ? 'bg-signal text-[#2a1b00]' : 'bg-muted text-muted-foreground')}>{tab.count}</span>}
        {tab.active && <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
      </Link>
    </li>)}</ul>
  </nav>;
}
