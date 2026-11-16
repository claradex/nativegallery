'use client';

import Script from 'next/script';
import { useState, type FormEvent } from 'react';

import type { CityRef } from '@nativegallery/contracts';

export interface VehicleRequestData {
  fields: { key: string; label: string; required: boolean; type: string }[];
  models: { id: number; title: string }[];
  cities: CityRef[];
  vehicles: { id: number; title: string; modelId: number | null; cityId: number | null; values: Record<string, string> }[];
  limited: boolean;
  siteKey: string;
}

type Values = Record<string, string>;

export function VehicleRequestForm({ data, action, initial = {} }: { data: VehicleRequestData; action: string; initial?: Values }) {
  const [values, setValues] = useState<Values>(() => Object.fromEntries(Object.entries(initial).filter(([, value]) => value)));
  const [base, setBase] = useState(0);
  const pick = (vehicle?: VehicleRequestData['vehicles'][number]) => {
    setBase(vehicle?.id ?? 0);
    setValues(vehicle ? { number: vehicle.title, model_id: String(vehicle.modelId ?? ''), city_id: String(vehicle.cityId ?? ''),
      ...Object.fromEntries(Object.entries(vehicle.values).map(([key, value]) => ['modelinput_' + key, value])) } : {});
  };
  const bind = (name: string) => ({ name, id: name, value: values[name] ?? '',
    onChange: (event: { currentTarget: { value: string } }) => {
      const value = event.currentTarget.value;
      setValues(current => ({ ...current, [name]: value }));
    } });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const body = new URLSearchParams();
    for (const [name, value] of new FormData(form)) body.append(name, String(value));
    if (event.nativeEvent instanceof SubmitEvent && event.nativeEvent.submitter instanceof HTMLInputElement) {
      const { name, value } = event.nativeEvent.submitter;
      if (name) body.append(name, value);
    }
    setPending(true);
    try {
      const response = await fetch(form.action, { method: 'POST', body });
      if (!response.ok) throw new Error('Request rejected');
      setSent(true);
    } catch {
      window.alert('Не удалось отправить заявку.');
      (window as Window & { turnstile?: { reset(): void } }).turnstile?.reset();
    } finally {
      setPending(false);
    }
  }

  return <tr><td className="main">
    <h1>Внесение изменений в БД</h1>
    {data.limited ? <div style={{ border: 'solid 1px rgb(140,0,0)', padding: '6px 10px 7px', marginBottom: 13, backgroundColor: 'rgb(216,137,137)' }}>
      Заявки можно отправлять раз в 24 часа
    </div> : sent ? <div style={{ border: 'solid 1px rgb(0,140,86)', padding: '6px 10px 7px', marginBottom: 13, backgroundColor: 'rgb(137,216,150)' }}>
      Заявка на рассмотрение успешно отправлена
    </div> : <form method="post" id="mform" onSubmit={submit} action={action}>
      <h4>Какую запись вы хотите уточнить?</h4>
      <div className="p20w"><table><tbody>
        <tr><th /><th>№</th><th>Название</th></tr>
        <tr className="s1"><td className="ds"><input type="radio" name="base_nid" value="0" checked={base === 0} onChange={() => pick()} /></td>
          <td className="d" colSpan={7}>Никакую, я хочу добавить новое ТС</td></tr>
        {data.vehicles.map(vehicle => <tr key={vehicle.id}>
          <td className="ds"><input type="radio" name="base_nid" value={vehicle.id} checked={base === vehicle.id} onChange={() => pick(vehicle)} /></td>
          <td className="n"><a href={'/vehicle/' + vehicle.id} target="_blank">{vehicle.id}</a></td>
          <td className="ds">{vehicle.title}</td>
        </tr>)}
      </tbody></table></div>
      <br style={{ clear: 'both' }} /><br />
      <div className="p20" style={{ paddingLeft: 5, marginBottom: 15 }}><table className="nospaces" width="100%"><tbody>
        <tr>
          <td className="lcol"><label htmlFor="number"><b>Бортовой №</b></label></td>
          <td style={{ paddingBottom: 15 }}><input type="text" {...bind('number')} style={{ width: 120 }} maxLength={64} required={base === 0} /></td>
        </tr>
        <tr>
          <td className="lcol"><label htmlFor="model_id">Модель</label></td>
          <td style={{ paddingBottom: 15 }}><select {...bind('model_id')}>
            <option value="">— не знаю / нет в списке —</option>
            {data.models.map(model => <option key={model.id} value={model.id}>{model.title}</option>)}
          </select></td>
        </tr>
        <tr>
          <td className="lcol"><label htmlFor="city_id">Город</label></td>
          <td style={{ paddingBottom: 15 }}><select {...bind('city_id')}>
            <option value="">— не указан —</option>
            {data.cities.map(city => <option key={city.id} value={city.id}>{city.title}{city.country ? ' (' + city.country.title + ')' : ''}</option>)}
          </select></td>
        </tr>
        {data.fields.map(field => <tr key={field.key}>
          <td className="lcol"><label htmlFor={'modelinput_' + field.key}>{field.required ? <b>{field.label}</b> : field.label}</label></td>
          <td style={{ paddingBottom: 15 }}>{field.type === '4'
            ? <textarea {...bind('modelinput_' + field.key)} rows={3} cols={40} maxLength={1000} required={field.required} />
            : <input type="text" {...bind('modelinput_' + field.key)} style={{ width: field.type === '1' ? 200 : 100 }} maxLength={1000}
              required={field.required} placeholder={field.type === '3' ? 'ММ.ГГГГ' : undefined} />}</td>
        </tr>)}
        {data.siteKey && <tr><td /><td><br /><div className="cf-turnstile" data-sitekey={data.siteKey} /></td></tr>}
        <tr><td /><td><br /><input type="submit" name="create" disabled={pending} value="     Отправить     " /></td></tr>
      </tbody></table></div>
    </form>}
    <div className="p20">
      <h4>Правила заполнения формы</h4>
      <ul className="straight">
        <li>Обязательные для заполнения поля выделены жирным шрифтом.</li>
        <li>Если какие-либо данные отсутствуют, оставьте соответствующее поле пустым. Пожалуйста, не вписывайте дефис и тому подобные знаки.</li>
        <li>Если требуемой модели нет в списке — оставьте «не знаю» и укажите её в примечании к фотографии. Редакторы добавят модель в базу.</li>
        <li>Если Вы обладаете информацией о приписке данного ТС, а поле «Депо/Парк» отсутствует, укажите эти данные в поле «Примечание».</li>
      </ul>
    </div>
    {data.siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
  </td></tr>;
}
