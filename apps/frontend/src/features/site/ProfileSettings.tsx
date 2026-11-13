import { Fragment } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { profileFields, type ProfileSettingsData } from '@nativegallery/contracts';
import { profileCountries } from './ProfileCountries';

const labels = ['Откуда:', 'Дата рождения', 'Владение языками', 'Telegram', 'ВКонтакте', 'Twitter/X', 'YouTube', 'Почта',
  'Instagram', 'TransPhoto', 'Личный сайт', 'Любимые модели поездов', 'Любимые страны', 'Любимые города'];
const textFields = profileFields.filter(key => key !== 'aboutrid' && key !== 'aboutmemo');
const fieldLabel = { marginBottom: 3, marginTop: 5 };
const panel = { textAlign: 'left', marginBottom: 15 } as const;

function ProfileForm({ data }: { data: ProfileSettingsData }) {
  const field = (key: typeof textFields[number], index: number) => <Fragment key={key}>
    <div style={fieldLabel}>{labels[index]}</div>
    <input type="text" name={key} id="live" style={{ width: '100%', marginBottom: key === 'aboutwebsite' ? 35 : undefined }} maxLength={50} defaultValue={data.fields[key]} />
  </Fragment>;
  return <>
    <div id="userphoto_big_div" style={{ position: 'absolute', display: 'none', padding: 10, backgroundColor: 'white', margin: 'auto', textAlign: 'center', left: 10 }} className="p5 shadow">
      <a href="#"><img alt="" id="userphoto_big_img" {...{ border: '0' }} /></a><br /><br /><a href="#">закрыть</a>
    </div>
    <p>Ссылка на публичный профиль: <b><a href={'/author/' + data.id + '/'} className="nw">{data.username}</a></b></p>
    <form method="post" name="form" id="form" encType="multipart/form-data" action="/api/profile/update" style={{ display: 'inline-block' }}>
      <div className="p20" style={panel}>
        <h4>Информация</h4>
        <div style={fieldLabel}>Страна:</div>
        <select name="aboutrid" style={{ width: '100%' }} defaultValue={data.fields.aboutrid || '0'}>
          {profileCountries.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        {textFields.slice(0, 3).map(field)}
        <div style={fieldLabel}>Пол</div>
        <select name="sex" style={{ width: '100%' }} defaultValue="1">
          <option value="0">(не указан)</option><option value="1">мужской</option><option value="2">женский</option>
        </select>
      </div>
      <div className="p20" style={panel}>
        <h4>О себе</h4>
        <div style={{ marginBottom: 15 }}><textarea name="aboutmemo" style={{ width: '100%', height: 200 }} defaultValue={data.fields.aboutmemo} /></div>
        <div className="sm">BBcode: [b] [i] [u] [s] [sub] [sup] [size] [img] [url]</div>
        {textFields.slice(3).map((key, index) => field(key, index + 3))}
        <div style={{ marginBottom: 7 }}><b>Фотография</b></div>
        <div style={{ marginBottom: 15 }}>
          <div id="userphoto_div" style={{ display: data.photourl ? undefined : 'none' }}>
            <a href="#" id="userphotoLink"><img src={data.photourl || undefined} alt="" id="userphoto_img" className="f" style={{ width: 'auto', maxWidth: 250 }} /></a>
            <div style={{ marginTop: 5, marginBottom: 7 }} className="sm"><input type="checkbox" name="remove_userphoto" id="remove_userphoto" /> <label htmlFor="remove_userphoto">удалить</label></div>
          </div>
          <div id="userphoto_file_span"><input type="file" name="userphoto" id="userphoto_file" accept="image/*" /></div>
          <div className="sm" style={{ marginTop: 3, color: '#888' }}>Для загрузки принимаются файлы JPEG объемом до 200 КБ и шириной не более 800 пикселей</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <input type="submit" id="submitBtn" style={{ width: 250, height: 30, marginBottom: 5 }} value="Отредактировать профиль" />
          <div><span style={{ color: 'red', fontWeight: 'bold', display: 'none' }} id="errors"></span><span style={{ display: 'none', fontWeight: 'bold', color: 'green' }} id="applied">✔&ensp;Изменения внесены</span></div>
        </div>
      </div>
    </form>
  </>;
}

export async function ProfileSettings({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const cookie = (await headers()).get('cookie');
  const response = await fetch(api + '/api/profile/settings', {
    headers: { cookie: cookie ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load profile settings');
  const { type } = await searchParams;
  const data: ProfileSettingsData = await response.json();
  const personalization = type === 'Personalization';
  const theme = cookie?.match(/(?:^|;\s*)NGALLERYTHEME=([^;]+)/)?.[1];
  return <tr><td className="main"><center><div className="tabs">
    <nav className="tab-nav">
      <a href="/lk/profile" className={type === undefined ? 'tab-item active' : 'tab-item'}>Профиль</a>
      <a href="?type=Personalization" className={personalization ? 'tab-item active' : 'tab-item'}>Внешний вид</a>
    </nav>
    <div className="tab-content">{personalization ? <form method="post" action="/lk/profile/theme" name="form" id="form" encType="multipart/form-data" style={{ display: 'inline-block' }}>
      <div className="p20" style={panel}>
        <h4>Оформление сайта</h4>
        <div style={fieldLabel}>Тема</div>
        <select name="theme_id" style={{ width: '100%' }} defaultValue={theme === 'nativegallery-dark' ? theme : 'standard'}>
          <option value="standard">Стандартная</option><option value="nativegallery-dark">NativeGallery Dark</option>
        </select>
      </div>
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <input type="submit" id="submitBtn" style={{ width: 250, height: 30, marginBottom: 5 }} value="Сохранить" />
        <div><span style={{ color: 'red', fontWeight: 'bold', display: 'none' }} id="errors"></span><span style={{ display: 'none', fontWeight: 'bold', color: 'green' }} id="applied">✔&ensp;Изменения внесены</span></div>
      </div>
    </form> : <ProfileForm data={data} />}</div>
  </div></center><script src="/frontend-scripts/ProfileSettings.js" defer /></td></tr>;
}
