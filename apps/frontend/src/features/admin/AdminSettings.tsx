import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { TaskList, type Task } from './settings/TaskList';

export function AdminSettings() {
  return AdminPage('editor', async () => {
    const tasks = await adminData<Task[]>('/api/admin/settings/tasks');
    return <>
      <PageHeader title="Фоновые задачи" description="Обработчики, которые работают в фоне. Остановленная задача копит очередь и продолжит её после запуска." />
      <TaskList tasks={tasks} />
    </>;
  });
}
