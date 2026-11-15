import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '../lib/utils';

/** A GET search form that keeps the section's other query parameters, so the result has its own address. */
export function SearchForm({ action = '/admin', hidden, value, placeholder, className }: {
  action?: string; hidden: Record<string, string>; value: string; placeholder: string; className?: string;
}) {
  return <form action={action} method="get" role="search" className={cn('relative', className)}>
    {Object.entries(hidden).map(([name, field]) => <input key={name} type="hidden" name={name} value={field} />)}
    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input type="search" name="q" defaultValue={value} placeholder={placeholder} aria-label={placeholder} className="pl-9" />
  </form>;
}
