'use client';

import Script from 'next/script';
import { useState, type FormEvent } from 'react';

export interface VehicleRequestData {
  labels: string[];
  vehicles: { id: number; title: string; fields: { value: string }[] }[];
  limited: boolean;
  siteKey: string;
}

export function VehicleRequestForm({ data, action }: { data: VehicleRequestData; action: string }) {
  const [values, setValues] = useState<string[]>([]);
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
        <tr className="s1"><td className="ds"><input type="radio" name="base_nid" value="0" defaultChecked onChange={() => setValues([])} /></td>
          <td className="d" colSpan={7}>Никакую, я хочу добавить новое ТС</td></tr>
        {data.vehicles.map(vehicle => <tr key={vehicle.id}>
          <td className="ds"><input type="radio" name="base_nid" value={vehicle.id} data-values={JSON.stringify(vehicle.fields.map(field => field.value))} onChange={() => setValues(vehicle.fields.map(field => field.value))} /></td>
          <td className="n"><a href={'/vehicle/' + vehicle.id} target="_blank">{vehicle.id}</a></td>
          <td className="ds">{vehicle.title}</td>
        </tr>)}
      </tbody></table></div>
      <br style={{ clear: 'both' }} /><br />
      <div className="p20" style={{ paddingLeft: 5, marginBottom: 15 }}><table className="nospaces" width="100%"><tbody>
        {data.labels.map((label, index) => <tr key={index}>
          <td className="lcol"><label htmlFor={'modelinput_' + (index + 1)}>{label}</label></td>
          <td style={{ paddingBottom: 15 }}><input name={'modelinput_' + (index + 1)} id={'modelinput_' + (index + 1)}
            style={{ width: 80 }} maxLength={21} required value={values[index] ?? ''} onChange={event => {
              const value = event.currentTarget.value;
              setValues(current => Object.assign([...current], { [index]: value }));
            }} /></td>
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
        <li>Если требуемой модели нет в списке — укажите её в поле «Примечание». После публикации фотографии модель будет добавлена в список.</li>
        <li>Если Вы обладаете информацией о приписке данного ТС, а поле «Депо/Парк» отсутствует, укажите эти данные в поле «Примечание».</li>
      </ul>
    </div>
    {data.siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
  </td></tr>;
}
