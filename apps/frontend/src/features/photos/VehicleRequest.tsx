import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface FormData {
  labels: string[];
  vehicles: { id: number; title: string; fields: { value: string }[] }[];
  limited: boolean;
  siteKey: string;
}

function Form({ data, id }: { data: FormData; id: string }) {
  return <tr><td className="main">
    <h1>Внесение изменений в БД</h1>
    {data.limited ? <div style={{ border: 'solid 1px rgb(140,0,0)', padding: '6px 10px 7px', marginBottom: 13, backgroundColor: 'rgb(216,137,137)' }}>
      Заявки можно отправлять раз в 24 часа
    </div> : <form method="post" id="mform" action={'/api/vehicles/requests/' + id}>
      <h4>Какую запись вы хотите уточнить?</h4>
      <div className="p20w"><table><tbody>
        <tr><th /><th>№</th><th>Название</th></tr>
        <tr className="s1"><td className="ds"><input type="radio" name="base_nid" value="0" defaultChecked /></td>
          <td className="d" colSpan={7}>Никакую, я хочу добавить новое ТС</td></tr>
        {data.vehicles.map(vehicle => <tr key={vehicle.id}>
          <td className="ds"><input type="radio" name="base_nid" value={vehicle.id} data-values={JSON.stringify(vehicle.fields.map(field => field.value))} /></td>
          <td className="n"><a href={'/vehicle/' + vehicle.id} target="_blank">{vehicle.id}</a></td>
          <td className="ds">{vehicle.title}</td>
        </tr>)}
      </tbody></table></div>
      <br style={{ clear: 'both' }} /><br />
      <div className="p20" style={{ paddingLeft: 5, marginBottom: 15 }}><table className="nospaces" width="100%"><tbody>
        {data.labels.map((label, index) => <tr key={index}>
          <td className="lcol"><label htmlFor={'modelinput_' + (index + 1)}>{label}</label></td>
          <td style={{ paddingBottom: 15 }}><input name={'modelinput_' + (index + 1)} id={'modelinput_' + (index + 1)}
            style={{ width: 80 }} maxLength={21} required /></td>
        </tr>)}
        {data.siteKey && <tr><td /><td><br /><div className="cf-turnstile" data-sitekey={data.siteKey} /></td></tr>}
        <tr><td /><td><br /><input type="submit" name="create" value="     Отправить     " /></td></tr>
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
    {data.siteKey && <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer />}
    <script src="/frontend-scripts/VehicleRequest.js" defer />
  </td></tr>;
}

export async function VehicleRequest({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const query = await searchParams;
  const id = typeof query.type === 'string' ? query.type : '';
  if (!/^\d{1,10}$/.test(id)) notFound();
  const search = new URLSearchParams();
  for (const key of ['num', 'gos']) {
    const value = query[key];
    if (typeof value === 'string' && value) search.set(key, value);
  }
  const response = await fetch(api + '/api/vehicles/requests/' + id + '?' + search, {
    cache: 'no-store', headers: { cookie: (await headers()).get('cookie') ?? '' },
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (response?.status === 404) notFound();
  if (!response?.ok) throw new Error('Could not load vehicle data');
  const data: FormData = await response.json();
  return <Form data={data} id={id} />;
}
