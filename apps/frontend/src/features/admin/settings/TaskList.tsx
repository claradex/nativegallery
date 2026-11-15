'use client';

import { AlertTriangle, Clapperboard, ImageDown, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../lib/format';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';

export interface Task {
  id: string; enabled: boolean; pending: number; failing: number; completedToday: number; lastCompletedAt: string | null; lastError: string | null;
}

const meta: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  ExecContests: { title: 'Проведение фотоконкурсов', description: 'Переводит конкурсы между этапами и подводит итоги.', icon: Trophy },
  BlurNewImage: { title: 'Размытые превью', description: 'Готовит размытую заглушку для новых фотографий, пока грузится оригинал.', icon: Sparkles },
  CompressImage: { title: 'Сжатие изображений', description: 'Пережимает загруженные фотографии для быстрой отдачи.', icon: ImageDown },
  RenderVideo: { title: 'Обработка видео', description: 'Перекодирует загруженные видео в H.264 и делает превью.', icon: Clapperboard },
};

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'destructive' }) {
  return <div className="grid gap-0.5">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={'text-lg font-semibold tabular-nums ' + (tone === 'destructive' && value ? 'text-destructive' : '')}>{value.toLocaleString('ru-RU')}</dd>
  </div>;
}

function TaskCard({ task }: { task: Task }) {
  const [enabled, setEnabled] = useState(task.enabled);
  const [pending, run] = useAction();
  const info = meta[task.id] ?? { title: task.id, description: '', icon: Sparkles };
  const Icon = info.icon;

  async function toggle(value: boolean) {
    setEnabled(value);
    const result = await run(() => send('/api/admin/settings/taskmanager?' + new URLSearchParams({ id: task.id, type: value ? '1' : '0' }),
      { fallback: 'Не удалось переключить задачу.' }), { success: info.title + (value ? ': запущена' : ': остановлена') });
    if (!result.ok) setEnabled(!value);
  }

  return <Card className="flex flex-col">
    <div className="flex items-start gap-4 p-5">
      <div className={'grid size-10 shrink-0 place-items-center rounded-lg ' + (enabled ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}><Icon className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{info.title}</h2>
          {enabled ? <Badge variant="success">Работает</Badge> : <Badge variant="secondary">Остановлена</Badge>}
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">{info.description}</p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{task.id}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={toggle} disabled={pending} aria-label={(enabled ? 'Остановить: ' : 'Запустить: ') + info.title} />
    </div>
    <dl className="grid grid-cols-3 gap-4 border-t px-5 py-4">
      <Stat label="В очереди" value={task.pending} />
      <Stat label="С ошибкой" value={task.failing} tone="destructive" />
      <Stat label="За сутки" value={task.completedToday} />
    </dl>
    <div className="mt-auto border-t px-5 py-3 text-[13px] text-muted-foreground">
      {task.lastCompletedAt ? 'Последнее выполнение: ' + formatDate(Date.parse(task.lastCompletedAt) / 1000) : 'Ещё не выполнялась'}
      {task.lastError && <p className="mt-2 flex items-start gap-2 rounded-md bg-destructive/8 px-3 py-2 text-destructive">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /><span className="line-clamp-3 font-mono text-xs break-all">{task.lastError}</span>
      </p>}
    </div>
  </Card>;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  return <ul className="grid gap-4 md:grid-cols-2">{tasks.map(task => <li key={task.id} className="grid"><TaskCard task={task} /></li>)}</ul>;
}
