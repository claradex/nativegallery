import { legacyDate } from '@nativegallery/contracts';
import { AdminPage } from './AdminPage';

interface NewsItem { id: number; body: string; time: number }

function NewsEditor() {
  return <>
    <h1><b>Новости сайта</b></h1>
    <a href="#" data-bs-toggle="modal" data-bs-target="#createNewsModal" className="btn btn-primary">Создать</a>
    <div className="modal fade" id="createNewsModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog"><form className="modal-content" id="create-news" method="post" action="/api/admin/news/create">
        <div className="modal-header">
          <h1 className="modal-title fs-5" id="exampleModalLabel"><b>Создать новость</b></h1>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div className="modal-body"><div className="mb-3">
          <label htmlFor="body" className="form-label">Содержание</label>
          <textarea className="form-control" id="body" name="body" rows={3} required />
        </div></div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="submit" className="btn btn-primary">Создать</button>
        </div>
      </form></div>
    </div>
  </>;
}

function NewsCards({ items }: { items: NewsItem[] }) {
  return <div id="news">{items.map(item => <div key={item.id} className="card mb-3"><div className="card-body">
    <i>{legacyDate(item.time)}</i><br />
    <span dangerouslySetInnerHTML={{ __html: item.body }} />
    <br /><a className="btn btn-danger mt-3" href="#" data-news-delete={item.id}>Удалить</a>
  </div></div>)}</div>;
}

export async function AdminNews(request: Request, api: string) {
  return AdminPage(request, api, 'Новости сайта', 'AdminNews', async options => {
    const response = await fetch(api + '/api/admin/news', options).catch(() => null);
    if (!response?.ok) return null;
    const items: NewsItem[] = await response.json();
    return <><NewsEditor /><NewsCards items={items} /></>;
  });
}
