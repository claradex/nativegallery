import { legacyDate } from '@nativegallery/contracts';
import { AdminPage } from './AdminPage';

interface PageSummary { id: number; title: string; created_at: number }

const formatting = [
  ['b', 'bold', 'Полужирный'],
  ['i', 'italic', 'Курсив'],
  ['u', 'underline', 'Подчёркнутый'],
  ['s', 'strikethrough', 'Зачёркнутый'],
  ['a', 'link', 'Ссылка'],
];

const attachments = [
  ['img', 'image-alt', 'Прикрепление фотографии'],
  ['video', 'video', 'Прикрепление видео'],
  ['audio', 'music', 'Прикрепление музыки'],
];

function PageEditor() {
  return <><form id="page-editor" method="post" action="/api/admin/pages">
    <div className="mb-3">
      <label htmlFor="title" className="form-label">Заголовок</label>
      <input name="title" id="title" className="form-control" maxLength={255} required />
    </div>
    <div className="col-md-auto d-flex align-items-center">
      {formatting.map(([tag, icon, label]) => <button key={tag} type="button" data-format={tag} aria-label={label}
        className="btn btn-primary btn-sm mb-2" style={{ marginRight: tag === 'a' ? 36 : 6 }}>
        <i className={'bx bx-' + icon} />
      </button>)}
      {attachments.map(([tag, icon, title]) => <button key={tag} type="button" data-attachment={tag} data-title={title}
        aria-label={title} className="btn btn-primary btn-sm mb-2" style={{ marginRight: 6 }}>
        <i className={'bx bx-' + icon} />
      </button>)}
    </div>
    <textarea id="bodypost" className="form-control" name="bodypost" placeholder="Вы можете написать свою историю" cols={30} rows={10} required />
    <div className="btn-group" role="group">
      <div id="buttonUpload"><button type="submit" id="createpost" className="btn btn-primary mb-3 mt-3">Опубликовать</button></div>
      <div id="buttonPreView"><button type="button" id="preview-page" className="btn btn-outline-primary mb-3 mt-3">Предпросмотр</button></div>
    </div>
    <div id="page-preview-error" className="text-danger" role="alert" hidden />
    <dialog id="page-preview" aria-labelledby="preview-title" className="border rounded p-3">
      <h1 id="preview-title"></h1>
      <div id="preview-content"></div>
      <button type="button" id="close-preview" className="btn btn-secondary mt-3">Закрыть</button>
    </dialog>
  </form>
  <dialog id="page-attachment" aria-labelledby="attachment-title" className="border rounded p-3">
    <form id="page-attachment-form">
      <h5 id="attachment-title"></h5>
      <label htmlFor="attachment-url" className="form-label">Адрес файла</label>
      <input id="attachment-url" className="form-control" type="url" required />
      <div className="mt-3">
        <button type="button" id="cancel-attachment" className="btn btn-secondary me-2">Отмена</button>
        <button type="submit" className="btn btn-primary">Прикрепить</button>
      </div>
    </form>
  </dialog></>;
}

export async function AdminPages(request: Request, api: string, create: boolean) {
  return AdminPage(request, api, 'Страницы', create ? 'AdminPages' : null, async options => {
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
