import { legacyDate } from '@nativegallery/contracts';
import { AdminPage } from './AdminPage';

interface PageSummary { id: number; title: string; created_at: number }

function PageEditor() {
  return <form method="post" action="/api/admin/pages">
    <div className="mb-3">
      <label htmlFor="title" className="form-label">Заголовок</label>
      <input name="title" id="title" className="form-control" maxLength={255} required />
    </div>
    <textarea id="bodypost" className="form-control" name="bodypost" placeholder="Вы можете написать свою историю" cols={30} rows={10} required />
    <div className="btn-group" role="group">
      <div id="buttonUpload"><button type="submit" id="createpost" className="btn btn-primary mb-3 mt-3">Опубликовать</button></div>
    </div>
  </form>;
}

export async function AdminPages(request: Request, api: string, create: boolean) {
  return AdminPage(request, api, 'Страницы', null, async options => {
    const response = await fetch(api + '/api/admin/pages', options).catch(() => null);
    if (response?.status === 403) return new Response('Forbidden', { status: 403 });
    if (!response?.ok) return null;
    if (create) return <PageEditor />;
    const pages: PageSummary[] = await response.json();
    return <>
      <h1><b>Страницы</b></h1>
      <a href="?type=PageCreate" className="btn btn-primary mb-3">Создать</a>
      <div id="pages">{pages.map(page => <div key={page.id} className="card mb-3"><div className="card-body">
        {legacyDate(page.created_at)}<br /><a href={'/page/' + page.id}>{page.title}</a>
      </div></div>)}</div>
    </>;
  });
}
