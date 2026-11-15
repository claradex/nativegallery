'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

/**
 * next/link that prefetches on hover only. Every page here is rendered per request, and viewport prefetching
 * re-requests every visible link after each refresh (rating, comments, moderation), which multiplies server load.
 */
export default function Link({ prefetch, onMouseEnter, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  const href = typeof props.href === 'string' ? props.href : null;
  return <NextLink {...props} prefetch={prefetch ?? false} onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(event);
    if (prefetch === undefined && href) router.prefetch(href);
  }} />;
}
