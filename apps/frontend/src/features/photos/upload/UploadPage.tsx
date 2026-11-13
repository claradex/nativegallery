import { UploadInteractions } from './UploadInteractions';
import type { UploadOptionsData } from '@nativegallery/contracts';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UploadMedia } from './UploadMedia';
import { UploadOptions } from './UploadOptions';
import { UploadLocation } from './UploadLocation';

function UploadForm({ data }: { data: UploadOptionsData }) {
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <tr><td className="main">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <h1>Предложить медиа на публикацию</h1>
    <p>Ваш текущий индекс загрузки: <b>{data.uploadIndex}</b></p>
    <div id="formtable">
      {data.directUpload && <div style={{ float: 'left', border: 'solid 1px #3b7dc1', padding: '6px 10px 7px', marginBottom: 13, backgroundColor: '#0199ff44' }}>
        <b>Поздравляем, {data.username}!</b><br />Администрацией {title} была одобрена возможность прямой загрузки фотографий для Вас.<br />Вы можете моментально загрузить любую фотографию, минуя премодерацию. Enjoy!
      </div>}
      <form id="mform" method="post" encType="multipart/form-data" action="/api/upload">
        <input type="hidden" name="creative" id="creative" />
        <input type="hidden" name="lat" id="markerLat" />
        <input type="hidden" name="lng" id="markerLng" />
        <table width="100%"><colgroup><col width="190" /></colgroup>
          <UploadMedia galleries={data.galleries} />
          <tbody><tr><td colSpan={2} style={{ height: 10 }}></td></tr></tbody>
          <tbody className="p20">
            <tr><td colSpan={2} id="step2" className="narrow" style={{ fontSize: 20, padding: '10px 15px 5px' }}>Шаг 2. <b>Укажите объект, присутствующие на медиа</b></td></tr>
            <tr className="lnk-vehicle"><td className="lcol">Вид сущности:</td><td style={{ paddingRight: 15 }}>
              <select name="search_type" id="search_type" className="s5">{data.entities.map(entity =>
                <option key={entity.id} value={entity.id} style={{ backgroundColor: entity.color }}>{entity.title}</option>)}
              </select>
            </td></tr>
            <tr className="lnk-vehicle"><td className="lcol">ID/Название модели:</td><td style={{ paddingRight: 15 }}>
              <input name="search_num" id="search_num" maxLength={15} style={{ width: 150, height: 22 }} />
              <input type="button" id="searchVehiclesByNumBtn" className="searchVehiclesBtn" style={{ height: 22, paddingTop: 0, position: 'relative', left: -1 }} value="Найти в БД" />
              <input type="hidden" name="nid" id="nid" />
              <div style={{ position: 'relative', zIndex: 2000, paddingTop: 4 }}><div id="vlist" className="shadow"></div></div>
            </td></tr>
          </tbody>
          <UploadLocation />
          <UploadOptions />
        </table>
      </form>
    </div><br />
    <div id="loadtable" className="p20" style={{ display: 'none', paddingBottom: 20, marginBottom: 15 }}>
      <h4>Загруженные фотографии</h4><div id="loadbox" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}></div>
    </div>
    <UploadInteractions />
  </td></tr>;
}

export async function UploadPage() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/upload/options', {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load upload options');
  const data: UploadOptionsData = await response.json();
  return <UploadForm data={data} />;
}
