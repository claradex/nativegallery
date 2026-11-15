import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from '../../../components/Link';
import { buttonVariants } from './button';
import { cn } from '../lib/utils';

/** Previous/next links with a compact window of page numbers around the current one. */
export function Pagination({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const window = [...new Set([1, page - 1, page, page + 1, pages])].filter(item => item >= 1 && item <= pages).sort((a, b) => a - b);
  const item = (target: number, label: React.ReactNode, aria?: string, disabled?: boolean) => disabled
    ? <span aria-hidden className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'pointer-events-none opacity-40')}>{label}</span>
    : <Link href={href(target)} aria-label={aria} aria-current={target === page && !aria ? 'page' : undefined}
      className={cn(buttonVariants({ variant: target === page && !aria ? 'outline' : 'ghost', size: 'icon-sm' }), 'tabular-nums')}>{label}</Link>;
  return <nav aria-label="Страницы" className="mt-6 flex items-center justify-center gap-1">
    {item(page - 1, <ChevronLeft className="size-4" />, 'Предыдущая страница', page <= 1)}
    {window.map((target, index) => <span key={target} className="contents">
      {index > 0 && target - window[index - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
      {item(target, target)}
    </span>)}
    {item(page + 1, <ChevronRight className="size-4" />, 'Следующая страница', page >= pages)}
  </nav>;
}
