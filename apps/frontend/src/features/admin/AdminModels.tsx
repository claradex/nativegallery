import { apiFetch } from '../../api/client';
import { Fragment } from 'react';
import { AdminPage } from './AdminPage';

interface PendingRequest {
  id: number;
  title: string;
  model: string;
  fields: { label: string; value: string }[];
}

export async function AdminModels(query: URLSearchParams) {
  return AdminPage('База моделей', 'AdminModels', async () => {
    const [requests, catalog] = await Promise.all([
      apiFetch('/api/admin/models/requests', { auth: true }),
      apiFetch('/api/admin/models/catalog', { auth: true }),
    ]);
    if (!requests?.ok || !catalog?.ok) return null;
    const rows: PendingRequest[] = await requests.json();
    const models: { id: number; title: string; model: string }[] = await catalog.json();
    const active = query.get('tab') === 'moderate' ? 'moderate' : 'list';
    return <>
      <h1><b>Модели</b></h1>
      <div className="v-header__tabs"><div className="v-tabs"><div className="v-tabs__scroll"><div className="v-tabs__content">
        <a href="/admin?type=Models" id="list" className={'v-tab v-tab-b' + (active === 'list' ? ' v-tab--active' : '')}>
          <span className="v-tab__label">Список</span>
        </a>
        <a href="/admin?type=Models&tab=moderate" id="moderate" className={'v-tab v-tab-b' + (active === 'moderate' ? ' v-tab--active' : '')}>
          <span className="v-tab__label">Заявки на добавление {rows.length > 0 && <span id="mdlnum" className="badge text-bg-danger">{rows.length}</span>}</span>
        </a>
      </div></div></div></div>
      {active === 'list' ? <div id="list__block" className="active__block">
        <a href="/admin?type=ModelsCreate" className="btn btn-primary mt-3">Создать</a>
        <div className="p20w" style={{ display: 'block' }}><table className="table"><tbody>
          <tr><th style={{ width: 100 }}>ID</th><th style={{ width: '20%' }}>Название</th><th style={{ width: '50%' }}>Сущность</th><th>Действия</th></tr>
          {models.map(model => <tr key={model.id} id={'pht' + model.id}>
            <td>{model.id}</td><td>{model.title}</td><td>{model.model}</td>
            <td className="c"><a className="btn btn-primary" href={'/admin?type=EntityEdit&id=' + model.id + '&mod=1'}>Редактировать</a>{' '}
              <button type="button" className="btn btn-danger" data-model-delete={model.id}>Удалить</button>
            </td>
          </tr>)}
        </tbody></table></div><br />
      </div> : <div id="moderate__block" className="active__block"><div className="p20w" style={{ display: 'block' }}>
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
      </div><br /></div>}
    </>;
  });
}
