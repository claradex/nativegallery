'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type MouseEvent as MouseEventReact } from 'react';
import { profileFields, type ProfileSettingsData } from '@nativegallery/contracts';
import { profileCountries } from './ProfileCountries';

const labels = ['Откуда:', 'Дата рождения', 'Владение языками', 'Telegram', 'ВКонтакте', 'Twitter/X', 'YouTube', 'Почта',
  'Instagram', 'TransPhoto', 'Личный сайт', 'Любимые модели поездов', 'Любимые страны', 'Любимые города'];
const textFields = profileFields.filter(key => key !== 'aboutrid' && key !== 'aboutmemo');
const fieldLabel = { marginBottom: 3, marginTop: 5 };
const panel = { textAlign: 'left', marginBottom: 15 } as const;

export function ProfileForm({ data }: { data: ProfileSettingsData }) {
  const [previewTop, setPreviewTop] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const popup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewTop === null) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (event.target instanceof Node && !popup.current?.contains(event.target)) setPreviewTop(null);
    }
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [previewTop]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    setError('');
    setSaved(false);
    setPending(true);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!response.ok) throw new Error('Не удалось сохранить изменения.');
      const result = await response.text();
      if (result === 'refresh') window.location.reload();
      else if (result) setError(result);
      else setSaved(true);
    } catch {
      setError('Не удалось сохранить изменения.');
    } finally {
      setPending(false);
    }
  }

  function closePreview(event: MouseEventReact<HTMLAnchorElement>) {
    event.preventDefault();
    setPreviewTop(null);
  }

  const field = (key: typeof textFields[number], index: number) => <Fragment key={key}>
    <div style={fieldLabel}>{labels[index]}</div>
    <input type="text" name={key} id="live" style={{ width: '100%', marginBottom: key === 'aboutwebsite' ? 35 : undefined }} maxLength={50} defaultValue={data.fields[key]} />
  </Fragment>;
  return <>
    <div ref={popup} id="userphoto_big_div" style={{ position: 'absolute', display: previewTop === null ? 'none' : 'block', top: previewTop ?? undefined, padding: 10, backgroundColor: 'white', margin: 'auto', textAlign: 'center', left: 10 }} className="p5 shadow">
      <a href="#" onClick={closePreview}><img alt="" src={previewTop === null ? undefined : data.photourl} id="userphoto_big_img" {...{ border: '0' }} /></a><br /><br /><a href="#" onClick={closePreview}>закрыть</a>
    </div>
    <p>Ссылка на публичный профиль: <b><a href={'/author/' + data.id + '/'} className="nw">{data.username}</a></b></p>
    <form method="post" name="form" id="form" encType="multipart/form-data" action="/api/profile/update" onSubmit={submit} style={{ display: 'inline-block' }}>
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
            <a href="#" id="userphotoLink" onClick={event => { event.preventDefault(); event.stopPropagation(); setPreviewTop(window.scrollY + 10); }}><img src={data.photourl || undefined} alt="" id="userphoto_img" className="f" style={{ width: 'auto', maxWidth: 250 }} /></a>
            <div style={{ marginTop: 5, marginBottom: 7 }} className="sm"><input type="checkbox" name="remove_userphoto" id="remove_userphoto" /> <label htmlFor="remove_userphoto">удалить</label></div>
          </div>
          <div id="userphoto_file_span"><input type="file" name="userphoto" id="userphoto_file" accept="image/*" /></div>
          <div className="sm" style={{ marginTop: 3, color: '#888' }}>Для загрузки принимаются файлы JPEG объемом до 200 КБ и шириной не более 800 пикселей</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <input type="submit" id="submitBtn" style={{ width: 250, height: 30, marginBottom: 5 }} value={pending ? 'Отправка данных...' : 'Отредактировать профиль'} disabled={pending} />
          <div><span style={{ color: 'red', fontWeight: 'bold', display: error ? 'inline' : 'none' }} id="errors">{error}</span><span style={{ display: saved ? 'inline' : 'none', fontWeight: 'bold', color: 'green' }} id="applied">✔&ensp;Изменения внесены</span></div>
        </div>
      </div>
    </form>
  </>;
}

export function ProfileThemeForm({ theme }: { theme?: string }) {
  return <form method="post" action="/lk/profile?type=Personalization" name="form" id="form" encType="multipart/form-data" style={{ display: 'inline-block' }}>
      <div className="p20" style={panel}>
        <h4>Оформление сайта</h4>
        <div style={fieldLabel}>Тема</div>
        <select name="theme_id" onChange={event => event.currentTarget.form?.requestSubmit()} style={{ width: '100%' }} defaultValue={theme === 'nativegallery-dark' ? theme : 'standard'}>
          <option value="standard">Стандартная</option><option value="nativegallery-dark">NativeGallery Dark</option>
        </select>
      </div>
      <div style={{ textAlign: 'center', marginTop: 25 }}>
        <input type="submit" id="submitBtn" style={{ width: 250, height: 30, marginBottom: 5 }} value="Сохранить" />
        <div><span style={{ color: 'red', fontWeight: 'bold', display: 'none' }} id="errors"></span><span style={{ display: 'none', fontWeight: 'bold', color: 'green' }} id="applied">✔&ensp;Изменения внесены</span></div>
      </div>
    </form>;
}
