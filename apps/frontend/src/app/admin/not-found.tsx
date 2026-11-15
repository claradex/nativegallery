import { SearchX } from 'lucide-react';
import { StatusPage } from '../../features/admin/StatusPage';
import { Button } from '../../features/admin/ui/button';

export default function NotFound() {
  return <StatusPage icon={SearchX} title="Раздел или запись не найдены"
    actions={<Button asChild variant="outline"><a href="/admin">К панели управления</a></Button>}>
    Возможно, запись удалили или ссылка устарела.
  </StatusPage>;
}
