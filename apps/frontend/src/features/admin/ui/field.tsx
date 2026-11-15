import { Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn('flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:opacity-50', className)} {...props} />;
}

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('grid gap-2', className)} {...props} />;
}

export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-[13px] leading-snug text-muted-foreground', className)} {...props} />;
}

export function FieldError({ className, children, ...props }: ComponentProps<'p'>) {
  if (!children) return null;
  return <p role="alert" className={cn('text-[13px] font-medium text-destructive', className)} {...props}>{children}</p>;
}
