import type { ReactNode } from 'react';
import { AdminPage } from './AdminPage';

interface Theme { id: number; title: string; status: number }
interface Contest { id: number; themeid: number; openpretendsdate: number; closepretendsdate: number; opendate: number; closedate: number; status: number }
const dates = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Moscow' });
const statuses = ['Ещё не проведён', 'Отбор кандидатов', 'Отбор победителей', 'Завершён'];
const fields = [['openpretendsdate', 'Дата начала отбора'], ['closepretendsdate', 'Дата конца отбора'],
  ['opendate', 'Дата начала'], ['closedate', 'Дата конца']];

function Editor({ id, title, endpoint, children }: { id: string; title: string; endpoint: string; children: ReactNode }) {
  return <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={id + '-title'} aria-hidden="true">
    <div className="modal-dialog"><form className="modal-content" action={'/api/admin/contests/' + endpoint} method="post" data-contest-editor>
      <div className="modal-header"><h1 className="modal-title fs-5" id={id + '-title'}><b>{title}</b></h1>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть" /></div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
        <button type="submit" className="btn btn-primary">Создать</button></div>
    </form></div>
  </div>;
}

export function AdminContests(api: string, query: URLSearchParams) {
  return AdminPage('Фотоконкурсы', 'AdminContests', async options => {
    const result = await fetch(api + '/api/admin/contests', options).catch(() => null);
    if (!result?.ok) return null;
    const { contests, themes, enabled }: { contests: Contest[]; themes: Theme[]; enabled: boolean } = await result.json();
    const categories = query.get('tab') === 'categories';
    const tabClass = (active: boolean) => 'v-tab v-tab-b' + (active ? ' v-tab--active' : '');
    const titles = new Map(themes.map(theme => [theme.id, theme.title]));
    return <>
      <h1><b>Фотоконкурсы</b></h1>
      <div className="v-header__tabs"><div className="v-tabs"><div className="v-tabs__scroll"><div className="v-tabs__content">
        <a href="/admin?type=Contests" className={tabClass(!categories)}><span className="v-tab__label">Конкурсы</span></a>
        <a href="/admin?type=Contests&tab=categories" className={tabClass(categories)}><span className="v-tab__label">Категории</span></a>
      </div></div></div></div>
      {categories ? <div id="categories__block" className="kandle__block active__block"><div className="p20w">
        <button type="button" className="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#createContestTheme">Создать</button>
        <table className="table"><thead><tr><th>ID</th><th>Название</th><th>В автоматическом отборе</th></tr></thead>
          <tbody>{themes.map(theme => <tr key={theme.id}><td>{theme.id}</td><td>{theme.title}</td><td>{theme.status === 1 ? 'Да' : 'Нет'}</td></tr>)}</tbody></table>
        <Editor id="createContestTheme" title="Добавление категории конкурса" endpoint="createtheme">
          <label className="form-label d-block">Содержание<input className="form-control" name="body" required /></label>
          <label className="form-check"><input className="form-check-input" name="active" type="checkbox" value="1" defaultChecked />В автоматическом отборе</label>
        </Editor>
      </div></div> : <div id="contests__block" className="kandle__block active__block"><div className="p20w">
        <button type="button" disabled={!enabled || !themes.length} className="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#createContest">Провести новый</button>
        {!enabled && <div className="alert alert-warning mt-3" role="alert">Задача проведения конкурсов отключена. <a href="/admin?type=Settings" className="btn btn-sm btn-outline-dark">Настройки</a></div>}
        <table className="table"><thead><tr><th>ID</th><th>Тема</th>{fields.map(([key, label]) => <th key={key}>{label}</th>)}<th>Статус</th></tr></thead>
          <tbody>{contests.map(contest => <tr key={contest.id}>
            <td>{contest.id}</td><td>{titles.get(contest.themeid)}</td>
            {[contest.openpretendsdate, contest.closepretendsdate, contest.opendate, contest.closedate].map((date, index) =>
              <td key={index}>{dates.format(date * 1000)}</td>)}
            <td>{statuses[contest.status] ?? 'Сбой'}</td>
          </tr>)}</tbody></table>
        <Editor id="createContest" title="Создание конкурса" endpoint="create">
          <label className="form-label d-block">Тема<select name="themeid" className="form-select" required>
            {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.title}</option>)}
          </select></label>
          {fields.map(([key, label]) => <label key={key} className="form-label d-block">{label}
            <input name={key} type="datetime-local" className="form-select" required />
          </label>)}
          <label className="form-check"><input name="startContestNow" type="checkbox" value="1" className="form-check-input" />Начать конкурс сразу после отбора</label>
        </Editor>
      </div></div>}
    </>;
  });
}
