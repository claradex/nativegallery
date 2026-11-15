import { ShieldAlert } from 'lucide-react';
import { StatusPage } from '../../features/admin/StatusPage';
import { Button } from '../../features/admin/ui/button';

export default function Forbidden() {
  return <StatusPage icon={ShieldAlert} title="Нет доступа к разделу"
    actions={<><Button asChild variant="outline"><a href="/">На сайт</a></Button><Button asChild><a href="/admin?type=Photo">К модерации</a></Button></>}>
    Этот раздел открыт только для ролей с более широкими правами. Попросите администратора изменить вашу роль.
  </StatusPage>;
}
