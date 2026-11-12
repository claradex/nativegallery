import { renderToStaticMarkup } from 'react-dom/server';
import { legacyDate, type PhotoCommentData, type PhotoPageData } from '@nativegallery/contracts';
import { PhotoComments } from './PhotoComments';
import { NotFound } from '../site/StaticPages';

function PhotoContent({ photo, comments }: { photo: PhotoPageData; comments: PhotoCommentData[] }) {
  return <tr><td className="main">
    {!photo.published && <div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff', textAlign: 'center' }}>Изображение находится на модерации</div>}
    <div id="err" />
    <div id="photobar">
      <div id="prev" title="Переход по профилю ТС"><span>&lt;</span></div>
      <div id="next" title="Переход по профилю ТС"><span>&gt;</span></div>
      <div id="underphoto_frame"><div id="ph_frame">
        <img id="ph" src={photo.url} alt="" title="Фотография" loading="lazy" />
      </div></div>
    </div>
    <div id="pmain">
      <table className="pwrite"><tbody><tr>
        <td className="nw" style={{ verticalAlign: 'top', textAlign: 'right' }}><b>{photo.place}</b></td>
        <td>{photo.description}</td>
      </tr></tbody></table>
      <div>Автор: <a href={'/author/' + photo.authorId + '/'}>{photo.author}</a>
        {'         Дата: '}<b>{photo.takenAt === 943909200 ? 'дата не указана' : legacyDate(photo.takenAt)}</b>
      </div>
      <table id="pp-items"><tbody><tr>
        <td id="pp-left-col">
          <div className="p20a" id="pp-item-info">
            <h4>Статистика</h4>
            <div className="sm">
              <div style={{ marginBottom: 10 }}>Лицензия: <b>BY-NC</b></div>
              Опубликовано <b>{legacyDate(photo.publishedAt)}</b><br />
              Просмотров — {photo.views}<br /><br />
              <a href={'/photoext?id=' + photo.id}>Подробная информация</a>
            </div>
          </div>
          {photo.signedIn && <div className="p0" id="pp-item-tools">
            <h4 className="pp-item-header">Инструменты</h4>
            <div className="pp-item-body" style={{ margin: '7px 5px' }}><div className="sm">
              <a className="tool-link" href="#" id="favLink" data-photo-id={photo.id}>
                {photo.favorite ? 'Удалить фото из Избранного' : 'Добавить фото в Избранное'}
              </a>
            </div></div>
          </div>}
        </td>
        <td id="pp-main-col">
          <div className="p0" id="pp-item-comments">
            <h4 className="pp-item-header">Комментарии{photo.commentsEnabled && <span id="commcount" style={{ fontWeight: 'normal' }}>
              {' '}<span style={{ color: '#aaa' }}>·</span> {comments.length}
            </span>}</h4>
            <div className="pp-item-body">
              {photo.commentsEnabled ? <PhotoComments comments={comments} />
                : <p>Комментарии отключены пользователем или по усмотрению Администрации.</p>}
            </div>
          </div>
        </td>
      </tr></tbody></table>
    </div>
  </td></tr>;
}

export async function PhotoPage(request: Request, api: string, id: string) {
  const init = { cache: 'no-store' as const, headers: { cookie: request.headers.get('cookie') ?? '' } };
  const response = await fetch(api + '/api/internal/photo-page/' + id, init).catch(() => null);
  if (response?.status === 404) return NotFound(request);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const photo: PhotoPageData = await response.json();
  let comments: PhotoCommentData[] = [];
  if (photo.commentsEnabled && photo.published) {
    const result = await fetch(api + '/api/internal/photo-comments/' + id, init).catch(() => null);
    if (!result?.ok) return new Response('Service Unavailable', { status: 503 });
    comments = await result.json();
  }
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body>' +
    '<div id="backgr"></div><table class="tmain">__NAVBAR__' +
    renderToStaticMarkup(<PhotoContent photo={photo} comments={comments} />) +
    '<tr>__FOOTER__</tr></table>__SCRIPT_PhotoActions__</body></html>';
}
