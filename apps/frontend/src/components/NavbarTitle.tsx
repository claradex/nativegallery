'use client';

import Link from './Link';
import { usePathname } from 'next/navigation';

/** Photo pages show the compact title inside the menu bar instead of the large logo row. */
function usePhotoPage() {
  return usePathname().split('/')[1] === 'photo';
}

const hidden = { display: 'none' };

export function SmallTitle({ logo, title }: { logo: string; title: string }) {
  return <Link style={usePhotoPage() ? undefined : hidden} id="title-small" href="/"><img src={logo} />{title}</Link>;
}

export function TitleRow({ logo, title }: { logo: string; title: string }) {
  return <tr style={usePhotoPage() ? hidden : undefined} id="navbard">
    <td><Link href="/" id="title"><img style={{ width: 70 }} src={logo} alt={title} /><span>{title}</span></Link></td>
  </tr>;
}
