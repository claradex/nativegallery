import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export const fieldControl = 'w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} data-slot="input" className={cn(fieldControl, 'h-9 py-1',
    'file:mr-3 file:h-7 file:rounded file:border-0 file:bg-secondary file:px-2.5 file:text-[13px] file:font-medium file:text-secondary-foreground',
    type === 'file' && 'h-auto py-1.5', type === 'color' && 'h-9 w-16 cursor-pointer p-1', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn(fieldControl, 'min-h-24 py-2 leading-relaxed', className)} {...props} />;
}

/** shadcn's NativeSelect: a real <select>, so it keeps working in plain forms and on phones. */
export function NativeSelect({ className, children, ...props }: ComponentProps<'select'>) {
  return <div className="relative">
    <select data-slot="native-select" className={cn(fieldControl, 'h-9 appearance-none py-1 pr-9', className)} {...props}>{children}</select>
    <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground">
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>;
}
