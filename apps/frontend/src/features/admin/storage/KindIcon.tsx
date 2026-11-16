import { Cloud, Database, Globe, HardDrive } from 'lucide-react';
import type { StorageKind } from '@nativegallery/contracts';

const icons = { disk: HardDrive, gdrive: Cloud, s3: Database, webdav: Globe } as const;

export function KindIcon({ kind, className }: { kind: StorageKind; className?: string }) {
  const Icon = icons[kind] ?? HardDrive;
  return <Icon className={className} aria-hidden />;
}
