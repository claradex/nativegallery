
interface GallerySummary {
  id: number;
  title: string;
}

export async function GalleryDirectory() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/galleries', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load this page');
  const galleries: GallerySummary[] = await response.json();
  return <tr><td className="main">
    <h1>Разные фотогалереи</h1>
    <div className="p20">
      <ul className="straight">
        {galleries.map(gallery => <li key={gallery.id}><a href={'/article/' + gallery.id}>{gallery.title}</a></li>)}
      </ul>
    </div>
  </td></tr>;
}
