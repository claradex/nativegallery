import { apiGet } from '../../api/client';

interface GallerySummary {
  id: number;
  title: string;
}

export async function GalleryDirectory() {
  const galleries = await apiGet<GallerySummary[]>('/api/internal/galleries');
  return <tr><td className="main">
    <h1>Разные фотогалереи</h1>
    <div className="p20">
      <ul className="straight">
        {galleries.map(gallery => <li key={gallery.id}><a href={'/article/' + gallery.id}>{gallery.title}</a></li>)}
      </ul>
    </div>
  </td></tr>;
}
