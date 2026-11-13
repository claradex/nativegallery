import { AdminPage } from './AdminPage';

function VariableFields() {
  return <>
    <div className="col-md-3"><div className="mb-3">
      <label htmlFor="variablename_1" className="form-label">Название переменной</label>
      <input name="variablename_1" id="variablename_1" className="form-control" placeholder="#FFFFFF" maxLength={255} required />
    </div></div>
    <div className="col-md-3"><div className="mb-3">
      <label htmlFor="variableid_1" className="form-label">ID</label>
      <input name="variableid_1" id="variableid_1" className="form-control" placeholder="blablabla" maxLength={64} required />
    </div></div>
    <div className="col-md-3">
      <label htmlFor="variabletype_1" className="form-label">Тип</label>
      <select name="variabletype_1" id="variabletype_1" className="form-select"><option value="1">Строка</option><option value="2">Число</option></select>
    </div>
    <div className="col-md-3">
      <label htmlFor="variableimportant_1" className="form-label">Обязателен?</label>
      <select name="variableimportant_1" id="variableimportant_1" className="form-select"><option value="1">Да</option><option value="2">Нет</option></select>
    </div>
  </>;
}

function EntityForm() {
  return <>
    <h1><b>Создание сущности</b></h1>
    <form id="entity-create" action="/api/admin/entities" method="post" style={{ display: 'inline-block', minWidth: 500 }}>
      <div className="mb-3"><label htmlFor="entity-title" className="form-label">Название</label>
        <input name="title" id="entity-title" className="form-control" placeholder="Вагон метро" maxLength={255} required />
      </div>
      <div className="mb-3"><label htmlFor="entity-color" className="form-label">Цвет</label>
        <input name="color" id="entity-color" type="color" className="form-control form-control-color" defaultValue="#563d7c" />
      </div>
      <p>Вводимые переменные</p>
      <div className="alert alert-dark" role="alert">
        Добавляйте и регулируйте поля ввода, которые будут являться шаблонной формой для создания моделей к сущности.
      </div>
      <div className="row" id="entityform"><VariableFields /></div>
      <button id="add-variable" type="button" className="btn btn-outline-primary">Добавить ещё</button>{' '}
      <button type="submit" className="btn btn-primary">Создать сущность</button>
      <p id="entity-status" role="status" hidden />
    </form>
  </>;
}

export function AdminEntities(request: Request, api: string, create: boolean) {
  return AdminPage(request, api, create ? 'Создание сущности' : 'Сущности', 'AdminEntities', async options => {
    if (create) return <EntityForm />;
    const response = await fetch(api + '/api/admin/entities', options).catch(() => null);
    if (!response?.ok) return null;
    const items: { id: number; title: string }[] = await response.json();
    return <>
      <h1><b>Сущности</b></h1>
      <a href="/admin?type=EntityCreate" className="btn btn-primary">Создать</a>
      <div className="p20w" style={{ display: 'block' }}><table className="table"><tbody>
        <tr><th style={{ width: 100 }}>ID</th><th style={{ width: '50%' }}>Название</th></tr>
        {items.map(item => <tr key={item.id}><td>{item.id}</td><td>{item.title}</td></tr>)}
      </tbody></table></div>
    </>;
  });
}
