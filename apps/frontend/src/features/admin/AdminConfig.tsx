import type { ConfigOverview } from '@nativegallery/contracts';
import { AdminPage, adminData } from './AdminPage';
import { PageHeader } from './PageHeader';
import { ConfigEditor } from './config/ConfigEditor';

/** The site settings from .env (formerly ngallery.yaml). Owner only, like the API behind it. */
export function AdminConfig() {
  return AdminPage('owner', async () => {
    const overview = await adminData<ConfigOverview>('/api/admin/config');
    return <>
      <PageHeader title="Конфигурация" description={<>Настройки сайта из файла <code className="font-mono text-[13px]">{overview.path}</code>.
        Изменения применяются сразу, перезапуск не нужен. Пустое поле означает значение по умолчанию.</>} />
      <ConfigEditor overview={overview} />
    </>;
  });
}
