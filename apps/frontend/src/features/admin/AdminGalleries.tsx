import { apiFetch } from '../../api/client';
import { forbidden } from 'next/navigation';
import { AdminPage } from './AdminPage';

interface Gallery {
  id: number;
  title: string;
  opened: number;
}

function GalleryForm({ gallery }: { gallery?: Gallery }) {
  const titleId = 'gallery-title-' + (gallery?.id ?? 'new');
  const openedId = 'gallery-opened-' + (gallery?.id ?? 'new');
  return <form className="card mb-3" method="post" action={'/api/admin/galleries' + (gallery ? '/' + gallery.id : '')}>
    <div className="card-body">
      {gallery && <a href={'/article/' + gallery.id}>{gallery.title}</a>}
      <div className="mb-3">
        <label className="form-label" htmlFor={titleId}>Название</label>
        <input className="form-control" id={titleId} name="title" defaultValue={gallery?.title} maxLength={255} required />
      </div>
      <div className="form-check mb-3">
        <input className="form-check-input" id={openedId} type="checkbox" name="opened" value="1" defaultChecked={gallery ? gallery.opened === 1 : true} />
        <label className="form-check-label" htmlFor={openedId}>Доступна при загрузке фотографий</label>
      </div>
      <button className="btn btn-primary" type="submit">{gallery ? 'Сохранить' : 'Создать'}</button>
    </div>
  </form>;
}

export async function AdminGalleries() {
  return AdminPage('Галереи', null, async () => {
    const response = await apiFetch('/api/admin/galleries', { auth: true });
    if (response?.status === 403) forbidden();
    if (!response?.ok) return null;
    const galleries: Gallery[] = await response.json();
    return <>
      <h1><b>Галереи</b></h1>
      <GalleryForm />
      {galleries.map(gallery => <GalleryForm key={gallery.id} gallery={gallery} />)}
    </>;
  });
}
