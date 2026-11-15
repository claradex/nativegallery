'use client';

import { TriangleAlert } from 'lucide-react';
import { StatusPage } from '../../features/admin/StatusPage';
import { Button } from '../../features/admin/ui/button';

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <StatusPage icon={TriangleAlert} title="Не удалось загрузить раздел"
    actions={<Button onClick={reset}>Повторить</Button>}>
    Сервер API не ответил или вернул ошибку. Проверьте, что он запущен, и попробуйте ещё раз.
  </StatusPage>;
}
