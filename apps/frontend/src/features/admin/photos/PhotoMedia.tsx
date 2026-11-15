import { isVideo } from '../lib/format';
import { cn } from '../lib/utils';

export function PhotoThumb({ url, className, controls }: { url: string; className?: string; controls?: boolean }) {
  if (isVideo(url)) return <video src={url} className={cn('size-full bg-black object-contain', className)} controls={controls} muted preload="metadata" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" loading="lazy" className={cn('size-full object-cover', className)} />;
}
