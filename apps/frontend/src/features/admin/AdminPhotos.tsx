import { AdminPage } from './AdminPage';

const publish = ['Нормальная публикация', 'Условная публикация', 'Временная публикация', 'Техническая публикация'];
const decline = ['Малоинформативный бред', 'Не подходит для сайта', 'Порнография', 'Травля/издевательство над человеком', 'Расчленёнка', 'Файл сломан'];

function Choices({ name, labels, start = 0, selected = 0 }: {
  name: string; labels: string[]; start?: number; selected?: number;
}) {
  return labels.map((label, index) => <label key={label} className="form-check d-block">
    <input name={name} value={index + start} type="radio" className="form-check-input" defaultChecked={index === selected} />
    <span className="form-check-label">{label}</span>
  </label>);
}

function Decision({ id, accepted }: { id: number; accepted: boolean }) {
  const modal = (accepted ? 'accept' : 'decline') + 'PhotoModal' + id;
  return <div className="modal fade" id={modal} tabIndex={-1} aria-labelledby={modal + '-title'} aria-hidden="true">
    <div className="modal-dialog"><form className="modal-content" data-photo-decision={id} data-status={accepted ? 1 : 2}>
      <div className="modal-header">
        <h1 className="modal-title fs-5" id={modal + '-title'}><b>{accepted ? 'Принятие фотографии' : 'Причина отклонения'}</b></h1>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть" />
      </div>
      <div className="modal-body">
        <Choices name="reason" labels={accepted ? publish : decline} start={accepted ? 0 : 1} selected={accepted ? 0 : 1} />
        {accepted && <>
          <h6 className="mt-3">Оценка</h6>
          <div className="row">
            <div className="col-6"><Choices name="irate" labels={['И-', 'И+']} selected={1} /></div>
            <div className="col-6"><Choices name="krate" labels={['К-', 'К+']} selected={1} /></div>
          </div>
          <h6 className="mt-3">Другие действия</h6>
        </>}
        <label className="form-label d-block">Дополнительный комментарий<textarea name="comment" className="form-control" rows={3} /></label>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" className="btn btn-primary">Сохранить</button>
      </div>
    </form></div>
  </div>;
}

interface PendingPhoto {
  id: number;
  photourl: string;
  place: string;
  postbody: string;
  user_id: number;
}

export function AdminPhotos(request: Request, api: string) {
  return AdminPage(request, api, 'Фотографии', 'AdminPhotos', async options => {
    const response = await fetch(api + '/api/admin/images/pending', options).catch(() => null);
    if (!response?.ok) return null;
    const photos: PendingPhoto[] = await response.json();
    return <>
      <h1><b>Фотографии</b></h1>
      <div className="v-header__tabs"><div className="v-tabs"><div className="v-tabs__scroll"><div className="v-tabs__content">
        <a id="moderate" href="/admin?type=Photo" className="v-tab v-tab-b v-tab--active"><span className="v-tab__label">На модерации</span></a>
      </div></div></div></div>
      <div id="moderate__block" className="active__block"><div className="p20w"><table className="table"><tbody>
        <tr><th style={{ width: 100 }}>Изображение</th><th style={{ width: '50%' }}>Информация</th><th>Действия</th></tr>
        {photos.map(photo => <tr key={photo.id} id={'pht' + photo.id}>
          <td><a href={'/photo/' + photo.id} target="_blank"><img src={photo.photourl} width={150} loading="lazy" alt="" /></a></td>
          <td><b>{photo.place}</b><p>{photo.postbody}</p><a href={'/author/' + photo.user_id}>Автор</a></td>
          <td className="c">
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target={'#acceptPhotoModal' + photo.id}>Принять</button>{' '}
            <button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target={'#declinePhotoModal' + photo.id}>Отклонить</button>
          </td>
        </tr>)}
      </tbody></table></div></div>
      {photos.map(photo => <div key={photo.id}><Decision id={photo.id} accepted /><Decision id={photo.id} accepted={false} /></div>)}
    </>;
  });
}
