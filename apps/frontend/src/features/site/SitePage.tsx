import type { SitePageData } from '@nativegallery/contracts';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';

export async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) notFound();
  const page = await apiGet<SitePageData>('/api/internal/pages/' + id, { missing: true });
  return <tr><td className="main">
    <h1>{page.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: page.html }} />
  </td></tr>;
}
