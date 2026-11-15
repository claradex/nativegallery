import Link from '../../components/Link';
import { PhotoInteractions } from './PhotoInteractions';
import { legacyDate, type PhotoCommentData, type PhotoPageData } from '@nativegallery/contracts';
import { CommentForm } from "./CommentForm";
import { PhotoVehicle, PhotoVehicleRoute } from './PhotoVehicle';
import { PhotoExif } from './PhotoExif';
import { PhotoMedia } from './PhotoMedia';
import { PhotoRating } from "./PhotoRating";
import { PhotoComments } from './PhotoComments';
import { notFound } from 'next/navigation';
import { apiFetch, apiGet, isId } from '../../api/client';

function PhotoContent({ photo, comments, scope }: { photo: PhotoPageData; comments: PhotoCommentData[]; scope: string }) {
  return <tr><td className="main">
    {!photo.published && <div className="label-orange" style={{ padding: 10, margin: '0 -20px', color: '#fff', textAlign: 'center' }}>{photo.processing ? 'Видео обрабатывается' : 'Изображение находится на модерации'}</div>}
    <div id="err" />
    {!photo.processing && <PhotoMedia photo={photo} scope={scope} />}
    <div id="pmain">
      {photo.vehicle && <div><div style={{ lineHeight: '15px', marginBottom: 10 }}>
        <table className="pwrite"><tbody><PhotoVehicleRoute vehicle={photo.vehicle} route={photo.vehicleRoute} /></tbody></table>
      </div></div>}
      {photo.place && <div><b>{photo.place}</b></div>}
      {photo.description && <div style={{ paddingTop: 8 }}>{photo.description}</div>}
      <br />
      <div>Автор: <b><Link href={'/author/' + photo.authorId + '/'}>{photo.author}</Link></b>
        {'\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 Дата: '}<b>{photo.takenAt === 943909200 ? 'не указана' : legacyDate(photo.takenAt)}</b>
      </div>
      <table id="pp-items"><tbody><tr>
        <td id="pp-left-col">
          <div className="p20a" id="pp-item-info">
            <h4>Статистика</h4>
            <div className="sm">
              <div style={{ marginBottom: 10 }}>Лицензия: <b>BY-NC</b></div>
              Опубликовано <b>{legacyDate(photo.publishedAt)}</b><br />
              Просмотров — {photo.views}<br /><br />
              <Link href={'/photoext?id=' + photo.id}>Подробная информация</Link>
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
    <PhotoInteractions key={photo.id} />
  </td></tr>;
}

export async function PhotoPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const query = await searchParams;
  const scope = new URLSearchParams();
  for (const key of ['vid', 'gid', 'aid', 'upd']) {
    const value = query[key];
    if (isId(value)) scope.set(key, value);
  }
  const suffix = scope.size ? '?' + scope : '';
  const error = 'Could not load the photo page';
  // Comments are requested alongside the photo; they are only used when the photo allows them.
  const [photo, result] = await Promise.all([
    apiGet<PhotoPageData>('/api/internal/photo-page/' + id + suffix, { auth: true, missing: true, error }),
    apiFetch('/api/internal/photo-comments/' + id, { auth: true }),
  ]);
  let comments: PhotoCommentData[] = [];
  if (photo.commentsEnabled && photo.published) {
    if (!result?.ok) throw new Error(error);
    comments = await result.json();
  }
  return <PhotoContent photo={photo} comments={comments} scope={suffix} />;
}
