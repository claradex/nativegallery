import { AdminPage } from './AdminPage';

interface Task {
  id: string;
  enabled: boolean;
}

export function AdminSettings(request: Request, api: string) {
  return AdminPage(request, api, 'Настройки', 'AdminSettings', async options => {
    const response = await fetch(api + '/api/admin/settings/tasks', options).catch(() => null);
    if (!response?.ok) return null;
    const tasks: Task[] = await response.json();
    return <>
      <h1><b>Настройки</b></h1>
      <div className="v-header__tabs"><div className="v-tabs"><div className="v-tabs__scroll"><div className="v-tabs__content">
        <a href="/admin?type=Settings" id="tasks" className="v-tab v-tab-b v-tab--active"><span className="v-tab__label">Задачи</span></a>
      </div></div></div></div>
      <div className="active__block" id="tasks__block"><table className="table"><tbody>
        <tr><th style={{ width: 100 }}>ID</th><th style={{ width: '50%' }}>Статус</th><th>Действия</th></tr>
        {tasks.map(task => <tr key={task.id} data-task={task.id}>
          <td>{task.id}</td><td data-task-status>{task.enabled ? 'Запущена' : 'Остановлена'}</td>
          <td className="c">
            <button type="button" className="btn btn-sm btn-primary" data-task-action="1">Запустить</button>{' '}
            <button type="button" className="btn btn-sm btn-danger" data-task-action="0">Остановить</button>
          </td>
        </tr>)}
      </tbody></table></div>
      <p id="task-error" role="alert" hidden />
    </>;
  });
}
