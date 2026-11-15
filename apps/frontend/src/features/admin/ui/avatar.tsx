import { cn } from '../lib/utils';

/** User picture with the initial as fallback (many accounts have no avatar URL). */
export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  return <span className={cn('relative inline-grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-[13px] font-semibold text-secondary-foreground uppercase', className)}>
    <span aria-hidden>{name.slice(0, 1) || '?'}</span>
    {src && /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
  </span>;
}
