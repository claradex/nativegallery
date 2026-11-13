import { Fragment } from 'react';
import { legacyDate, type UploadHistoryData } from '@nativegallery/contracts';

const statuses = [
  [1, 'В рассмотрении'],
  [2, 'Принято'],
  [7, 'Принято условно'],
  [9, 'Принято как временное'],
  [3, 'Задержано до исправления замечаний'],
  [5, 'Не подходит для сайта'],
  [8, 'Удалено'],
] as const;

const declineReasons = [
  'Не подходит для сайта',
  'Малоинформативный бред',
  'Не подходит для сайта',
  'Порнография',
  'Травля/Издевательство над человеком',
  'Расчленёнка',
  'Файл сломан',
];

export function UploadHistory({ author, photos, sort }: UploadHistoryData & { sort: string }) {
  return <>
    <h1>Журнал</h1>
    <div className="sm">
      {statuses.map(([code, label]) => <div key={code} className={'p20 s' + code}
        style={{ float: 'left', padding: '1px 5px 2px', marginRight: 15 }}>{label}</div>)}
    </div><br {...{ style: undefined, clear: 'all' }} /><br />
    <div className="sm">Сортировка фотографий:&ensp;{[
      'в порядке загрузки', 'в порядке выхода из очереди', 'сначала неопубликованные (в порядке загрузки)',
    ].map((label, index) => <Fragment key={label}>
      {index > 0 && <>&ensp;·&ensp;</>}
      {String(index) === sort ? <b>{label}</b> : <a href={'/set.php?lk_upl_sort=' + index}>{label}</a>}
    </Fragment>)}</div><br />
    <div className="p20w" style={{ display: 'block' }}>
      <table><tbody>
        <tr><th {...{ width: '100' }}>Изображение</th><th {...{ width: '90%' }}>Информация</th><th></th><th className="c nw">Покинуло очередь</th><th className="c nw">Действия</th></tr>
        {photos.map(photo => <tr key={photo.id} className={photo.moderated === 0 ? 's0' : photo.moderated === 2 ? 's15' : 's12'}>
          <td className="pb-photo pb_photo"><a href={'/photo/' + photo.id + '/'} target="_blank" className="prw">
            <img src={photo.photourl} className="f" />
          </a></td>
          <td className="d">
            <p><span style={{ wordSpacing: -1 }}><b>{photo.place}</b></span></p>
            <p className="sm"><b>{legacyDate(photo.posted_at)}</b><br />Автор: <a href={'/author/' + author.id + '/'}>{author.username}</a></p>
            {photo.moderated === 2 && <p className="sm"><b>Причина отклонения: {declineReasons[photo.declineReason] ?? declineReasons[0]}</b></p>}
            {photo.declineComment && <p className="sm"><b>Комментарий: </b> {photo.declineComment}</p>}
          </td>
          <td className="c" style={{ padding: 10 }}></td>
          <td className="cs">{(photo.moderated === 0 || photo.endmoderation === -1) ? 'На модерации' : <>
            {legacyDate(photo.endmoderation)}<div style={{ marginTop: 15 }}>Оценка<br /><b>И{photo.rating} К{photo.rating}</b></div>
          </>}</td>
          <td className="cs"><a type="button" href={'/lk/editimage?id=' + photo.id}>Редактировать</a></td>
        </tr>)}
      </tbody></table>
    </div><br />
  </>;
}
