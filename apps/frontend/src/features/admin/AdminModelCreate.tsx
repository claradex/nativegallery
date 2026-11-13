import { NotFound } from '../site/StaticPages';
import { AdminPage } from './AdminPage';

interface Entity { id: number; title: string; color: string }

export function AdminModelCreate(request: Request, api: string, id?: string) {
  if (id !== undefined && !/^\d{1,10}$/.test(id)) return NotFound(request);
  const heading = id ? 'Редактирование модели' : 'Создание модели';
  return AdminPage(request, api, heading, 'AdminModelCreate', async options => {
    const response = await fetch(api + '/api/internal/vehicle-models', options).catch(() => null);
    if (!response?.ok) return null;
    const entities: Entity[] = await response.json();
    let model: { entityid: number; title: string; comment: string | null; content: string | null } | undefined;
    if (id) {
      const result = await fetch(api + '/api/admin/models/catalog/' + id, options).catch(() => null);
      if (result?.status === 404) return NotFound(request);
      if (!result?.ok) return null;
      model = await result.json();
    }
    return <>
      <h1><b>{heading}</b></h1>
      <form action={'/api/admin/models/catalog' + (id ? '/' + id : '')} data-edit={id ? 'true' : undefined} data-content={model?.content ?? undefined} method="post" id="form" style={{ display: 'inline-block', minWidth: 500 }}>
        <div id="inputsMain">
          <label htmlFor="entitySelect">Сущность</label>
          <select name="entityid" id="entitySelect" className="form-select" defaultValue={model?.entityid ?? ''} disabled={!!model} required>
            <option disabled value="">Выберите сущность</option>
            {entities.map(entity => <option key={entity.id} value={entity.id} style={{ backgroundColor: entity.color }}>{entity.title}</option>)}
          </select>
          <div className="mt-3">
            <label htmlFor="model-title" className="form-label">Название</label>
            <input type="text" name="title" className="form-control" id="model-title" defaultValue={model?.title} required />
          </div>
          <div className="mt-3">
            <label htmlFor="model-description" className="form-label">Описание</label>
            <input type="text" name="comment" className="form-control" id="model-description" defaultValue={model?.comment ?? ''} required />
          </div>
        </div>
        <div id="mainContent" />
        <button id="addButton" type="submit" className="btn btn-primary mt-5" hidden disabled>{id ? 'Сохранить' : 'Добавить модель'}</button>
        <p id="model-status" role="status" hidden />
      </form>
    </>;
  });
}
