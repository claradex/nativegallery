import { legacyDate, type PhotoCommentData, type PhotoPageData } from '@nativegallery/contracts';
import { CommentForm } from "./CommentForm";
import { PhotoVehicle, PhotoVehicleRoute } from './PhotoVehicle';
import { PhotoExif } from './PhotoExif';
import { PhotoMedia } from './PhotoMedia';
import { PhotoRating } from "./PhotoRating";
import { PhotoComments } from './PhotoComments';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

function PhotoContent({ photo, comments, scope }: { photo: PhotoPageData; comments: PhotoCommentData[]; scope: string }) {
  return <tr><td className="main">
    {!photo.published && <div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff', textAlign: 'center' }}>{photo.processing ? 'Видео обрабатывается' : 'Изображение находится на модерации'}</div>}
    <div id="err" />
    {!photo.processing && <PhotoMedia photo={photo} scope={scope} />}
    <div id="pmain">
      <table className="pwrite"><tbody><tr>
        <td className="nw" style={{ verticalAlign: 'top', textAlign: 'right' }}><b>{photo.place}</b></td>
        <td>{photo.description}</td>
      </tr>{photo.vehicle && <PhotoVehicleRoute vehicle={photo.vehicle} route={photo.vehicleRoute} />}</tbody></table>
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
          <PhotoRating photo={photo} />
        </td>
        <td id="pp-main-col">
          {photo.vehicle && <PhotoVehicle vehicle={photo.vehicle} />}
          <PhotoExif fields={photo.exif} />
          <div className="p0" id="pp-item-comments">
            <h4 className="pp-item-header">Комментарии{photo.commentsEnabled && <span id="commcount" style={{ fontWeight: 'normal' }}>
              {' '}<span style={{ color: '#aaa' }}>·</span> {comments.length}
            </span>}</h4>
            <div className="pp-item-body">
              {photo.commentsEnabled ? <><PhotoComments comments={comments} />{photo.published && <CommentForm photoId={photo.id} signedIn={photo.signedIn} allowed={photo.canComment} />}</>
                : <p>Комментарии отключены пользователем или по усмотрению Администрации.</p>}
            </div>
          </div>
        </td>
      </tr></tbody></table>
    </div>
    <script src="/frontend-scripts/PhotoActions.js" defer />
    <script src="/frontend-scripts/CommentEmoji.js" defer />
  </td></tr>;
}

export async function PhotoPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  if (!/^\d{1,10}$/.test(id)) notFound();
  const query = await searchParams;
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const init = { cache: 'no-store' as const, headers: { cookie: (await headers()).get('cookie') ?? '' } };
  const scope = new URLSearchParams();
  for (const key of ['vid', 'gid', 'aid', 'upd']) {
    const value = query[key];
    if (typeof value === 'string' && /^\d{1,10}$/.test(value)) scope.set(key, value);
  }
  const suffix = scope.size ? '?' + scope : '';
  const response = await fetch(api + '/api/internal/photo-page/' + id + suffix, init).catch(() => null);
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Could not load the photo page');
  const photo: PhotoPageData = await response.json();
  let comments: PhotoCommentData[] = [];
  if (photo.commentsEnabled && photo.published) {
    const result = await fetch(api + '/api/internal/photo-comments/' + id, init).catch(() => null);
    if (!result?.ok) throw new Error('Could not load the photo page');
    comments = await result.json();
  }
  return <PhotoContent photo={photo} comments={comments} scope={suffix} />;
}
