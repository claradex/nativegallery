import type { SitePageData } from '@nativegallery/contracts';
import { notFound } from 'next/navigation';

export async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) notFound();
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/pages/' + id, { cache: 'no-store' }).catch(() => null);
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Could not load this page');
  const page: SitePageData = await response.json();
  return <tr><td className="main">
    <h1>{page.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: page.html }} />
  </td></tr>;
}
