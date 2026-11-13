import { AdminPage } from './AdminPage';

export function AdminGeo(api: string) {
  return AdminPage('GeoDB', 'AdminGeo', async options => {
    const response = await fetch(api + '/api/admin/geodb', options).catch(() => null);
    if (!response?.ok) return null;
    const entries: { id: number; title: string }[] = await response.json();
    return <>
      <h1><b>GeoDB</b></h1>
      <a href="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createGeoDB">Создать</a>
      <table id="geo-list" className="table" style={{ marginTop: 15 }}>
        <thead><tr><th scope="col">ID</th><th scope="col">Название</th><th scope="col" /></tr></thead>
        <tbody>{entries.map(entry => <tr key={entry.id} id={'geodb' + entry.id}>
          <th scope="row">{entry.id}</th><td>{entry.title}</td>
          <td><div className="cmt-submit">
            <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 15 }} data-geo-delete={entry.id}>Удалить</button>
          </div></td>
        </tr>)}</tbody>
      </table>
      <div className="modal fade" id="createGeoDB" tabIndex={-1} aria-labelledby="geo-title" aria-hidden="true">
        <div className="modal-dialog"><form id="geo-create" className="modal-content" action="/api/admin/geodb/create" method="post">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="geo-title"><b>Добавление элемента GeoDB</b></h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть" />
          </div>
          <div className="modal-body"><div className="mb-3">
            <label htmlFor="geo-body" className="form-label">Содержание</label>
            <textarea className="form-control" id="geo-body" name="body" rows={3} required />
          </div></div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="submit" className="btn btn-primary">Добавить</button>
          </div>
        </form></div>
      </div>
    </>;
  });
}
