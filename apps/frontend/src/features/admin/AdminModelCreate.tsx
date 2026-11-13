import { AdminPage } from './AdminPage';

interface Entity { id: number; title: string; color: string }

export function AdminModelCreate(request: Request, api: string) {
  return AdminPage(request, api, 'Создание модели', 'AdminModelCreate', async options => {
    const response = await fetch(api + '/api/internal/vehicle-models', options).catch(() => null);
    if (!response?.ok) return null;
    const entities: Entity[] = await response.json();
    return <>
      <h1><b>Создание модели</b></h1>
      <form action="/api/admin/models/catalog" method="post" id="form" style={{ display: 'inline-block', minWidth: 500 }}>
        <div id="inputsMain">
          <label htmlFor="entitySelect">Сущность</label>
          <select name="entityid" id="entitySelect" className="form-select" defaultValue="" required>
            <option disabled value="">Выберите сущность</option>
            {entities.map(entity => <option key={entity.id} value={entity.id} style={{ backgroundColor: entity.color }}>{entity.title}</option>)}
          </select>
          <div className="mt-3">
            <label htmlFor="model-title" className="form-label">Название</label>
            <input type="text" name="title" className="form-control" id="model-title" required />
          </div>
          <div className="mt-3">
            <label htmlFor="model-description" className="form-label">Описание</label>
            <input type="text" name="comment" className="form-control" id="model-description" required />
          </div>
        </div>
        <div id="mainContent" />
        <button id="addButton" type="submit" className="btn btn-primary mt-5" hidden disabled>Добавить модель</button>
        <p id="model-status" role="status" hidden />
      </form>
    </>;
  });
}
