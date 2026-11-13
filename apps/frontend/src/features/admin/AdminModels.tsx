import { Fragment } from 'react';
import { AdminPage } from './AdminPage';

interface PendingRequest {
  id: number;
  title: string;
  model: string;
  fields: { label: string; value: string }[];
}

export async function AdminModels(request: Request, api: string) {
  return AdminPage(request, api, 'База моделей', 'AdminModels', async options => {
    const response = await fetch(api + '/api/admin/models/requests', options).catch(() => null);
    if (!response?.ok) return null;
    const rows: PendingRequest[] = await response.json();
    return <>
      <h1><b>База моделей</b></h1>
      <div id="moderate__block"><div className="p20w" style={{ display: 'block' }}>
        <table className="table"><tbody>
          <tr><th>ID</th><th>Название</th><th>Сущность</th><th>Данные</th><th>Действия</th></tr>
          {rows.map(row => <tr key={row.id} id={'mdl' + row.id} data-request={row.id}>
            <td>{row.id}</td><td>{row.title}</td><td>{row.model}</td>
            <td>{row.fields.map(({ label, value }, index) => <Fragment key={index}><b>{label}: </b>{value}<br /></Fragment>)}</td>
            <td className="c">
              <button type="button" className="btn btn-primary" data-decision="accept">Принять</button>{' '}
              <button type="button" className="btn btn-danger" data-decision="decline">Отклонить</button>
            </td>
          </tr>)}
        </tbody></table>
      </div><br /></div>
    </>;
  });
}
