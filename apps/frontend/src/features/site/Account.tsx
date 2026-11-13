import { renderToStaticMarkup } from '../../components/RenderMarkup';
import { UploadHistory } from './UploadHistory';

interface Summary { id: number; username: string; published: number; pending: number; uploadIndex: number | null }
interface IndexEvent { id: number; oldindex: number; newindex: number; date: number; type: number; photo_id: number }

function AccountSummary({ data }: { data: Summary }) {
  return <>
    <h1>Общая информация</h1>
    <h4>Здравствуйте, <a href={'/author/' + data.id + '/'}>{data.username}</a>!</h4>
    <p>Количество ваших фотографий на сайте: <b>{data.published}</b></p>
    <p>Всего фотографий в очереди на публикацию: <b>{data.pending}</b></p><br />
    {data.uploadIndex !== null && <>
      <h4>Индекс загрузки</h4>
      <p>Текущее значение <a href="/page/111" className="und">индекса загрузки</a>: <b>{data.uploadIndex}</b></p>
      <div className="p20" style={{ float: 'left', padding: '15px 15px 20px', width: 240 }}>
        <div style={{ backgroundColor: '#fff', width: 240, height: 16 }} />
        <div style={{ backgroundColor: '#599fe7', width: 4 * data.uploadIndex, height: 14, position: 'relative', top: -15, marginBottom: -19 }} />
        <img src="/static/img/scale1.png" alt="" loading="lazy" style={{ position: 'relative', top: -12, marginLeft: -5, marginBottom: -22 }} />
      </div><br style={{ clear: 'both' }} />
      <p><a href="/lk/pday" className="und">История изменения индекса загрузки</a></p>
    </>}
    <br style={{ clear: 'both' }} /><br /><br />&nbsp;
  </>;
}

const dates = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Europe/Moscow' });

function IndexHistory({ events }: { events: IndexEvent[] }) {
  return <div style={{ textAlign: 'center' }}>
    <h1>История изменения индекса загрузки</h1>
    <table style={{ marginInline: 'auto' }}><tbody>
      <tr><th>Дата и время</th><th className="r">Индекс</th><th className="r">Изменение</th><th>Действие</th><th>Фотография</th></tr>
      {events.map(event => {
        const delta = event.newindex - event.oldindex;
        const link = '/photo/' + event.photo_id;
        return <tr key={event.id} className={event.type === 1 ? 's12' : event.type === 2 ? 's15' : undefined}>
          <td className="ds">{dates.format(event.date * 1000)}</td><td className="r"><b>{event.newindex}</b></td>
          <td className="r">{delta > 0 ? '+' : ''}{delta}</td>
          <td className="ds">{event.type === 1 ? 'Публикация' : event.type === 2 ? 'Отклонение' : ''}</td>
          <td className="d">{event.photo_id > 0 && <a href={link} target="_blank">{link}</a>}</td>
        </tr>;
      })}
    </tbody></table><br />
  </div>;
}

export async function Account(request: Request, api: string, section: '' | 'upload-index' | 'uploads') {
  const response = await fetch(api + '/api/internal/account' + (section ? '/' + section : ''), {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) return Response.redirect(new URL('/login', request.url), 302);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const data = await response.json();
  const content = section === 'uploads' ? <UploadHistory {...data} />
    : section === 'upload-index' ? <IndexHistory events={data} /> : <AccountSummary data={data} />;
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    renderToStaticMarkup(<tr><td className="main">{content}</td></tr>) +
    '<tr>__FOOTER__</tr></table></body></html>';
}
