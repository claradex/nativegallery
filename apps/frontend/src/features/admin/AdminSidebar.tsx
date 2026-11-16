'use client';

import { Boxes, Camera, Database, ExternalLink, FileText, Globe, Images, Inbox, LogOut, Menu, Newspaper, Settings, SlidersHorizontal, TrainFront, Trophy, Users, type LucideIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from '../../components/Link';
import { cn } from './lib/utils';
import { can } from './lib/roles';
import { href, menu, menuKey } from './lib/sections';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';

const icons: Record<string, LucideIcon> = {
  camera: Camera, inbox: Inbox, newspaper: Newspaper, file: FileText, images: Images, trophy: Trophy,
  boxes: Boxes, database: Database, train: TrainFront, globe: Globe, users: Users, settings: Settings, sliders: SlidersHorizontal,
};

export interface SidebarProps {
  title: string;
  viewer: { id: number; username: string; admin: number };
  counts: { pendingPhotos: number; pendingRequests: number };
}

function Navigation({ title, viewer, counts, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const params = useSearchParams();
  const active = menuKey(params.get('type'), params.get('tab'));
  return <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 pt-5 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-signal">
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-accent">
        {/* Two rails and sleepers: the gallery is about transport photography. */}
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 3 6 21M16 3l2 18" className="text-white" />
          <path d="M7.4 7.5h9.2M6.9 12h10.2M6.4 16.5h11.2" className="text-signal" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-white">{title}</span>
        <span className="block text-xs text-sidebar-muted">Панель управления</span>
      </span>
    </Link>
    <nav aria-label="Разделы" className="flex-1 overflow-y-auto px-3 pb-4">
      {menu.map(({ group, items }) => {
        const allowed = items.filter(item => can(viewer.admin, item.role));
        if (!allowed.length) return null;
        return <div key={group} className="mt-4 first:mt-1">
          <p className="px-2 pb-1.5 text-[11px] font-medium text-sidebar-muted">{group}</p>
          <ul className="grid gap-0.5">{allowed.map(item => {
            const Icon = icons[item.icon];
            const current = item.key === active;
            const count = 'badge' in item ? counts[item.badge] : 0;
            return <li key={item.key}><Link href={href(item.key)} onClick={onNavigate} aria-current={current ? 'page' : undefined}
              className={cn('group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-signal',
                current ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/60 hover:text-white')}>
              {current && <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r bg-signal" />}
              <Icon className={cn('size-[18px] shrink-0', current ? 'text-signal' : 'text-sidebar-muted group-hover:text-sidebar-foreground')} />
              <span className="truncate">{item.label}</span>
              {count > 0 && <span className="ml-auto rounded-full bg-signal px-1.5 py-px text-[11px] font-semibold text-[#2a1b00] tabular-nums">
                {count > 99 ? '99+' : count}<span className="sr-only"> ожидают</span>
              </span>}
            </Link></li>;
          })}</ul>
        </div>;
      })}
    </nav>
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-[13px] font-semibold text-white uppercase">{viewer.username.slice(0, 1)}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-white">{viewer.username}</span>
        <a href="/logout" title="Выйти" className="rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-white">
          <LogOut className="size-4" /><span className="sr-only">Выйти</span>
        </a>
      </div>
      <a href="/" className="mt-1 flex h-8 items-center gap-2 rounded-md px-2 text-[13px] text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-white">
        <ExternalLink className="size-3.5" />Открыть сайт
      </a>
    </div>
  </div>;
}

export function AdminSidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams().toString();
  useEffect(() => setOpen(false), [params]);
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><Navigation {...props} /></aside>
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-sidebar px-3 text-white lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-sidebar-accent hover:text-white" aria-label="Открыть меню"><Menu className="size-5" /></Button>
        </SheetTrigger>
        <SheetContent><SheetTitle className="sr-only">Меню панели управления</SheetTitle><Navigation {...props} onNavigate={() => setOpen(false)} /></SheetContent>
      </Sheet>
      <Link href="/admin" className="truncate text-[15px] font-semibold">{props.title}</Link>
      {props.counts.pendingPhotos > 0 && can(props.viewer.admin, 'moderator') &&
        <Link href="/admin?type=Photo" className="ml-auto flex items-center gap-1.5 rounded-full bg-signal px-2.5 py-1 text-xs font-semibold text-[#2a1b00]">
          <Camera className="size-3.5" />{props.counts.pendingPhotos}<span className="sr-only"> фото ждут модерации</span>
        </Link>}
    </header>
  </>;
}
