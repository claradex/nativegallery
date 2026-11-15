'use client';

import { AlertTriangle, KeyRound, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { settingDefinitions, settingError, settingGroups, type ConfigOverview, type SettingDefinition } from '@nativegallery/contracts';
import { refreshPage } from '../../../components/navigation';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FieldDescription, FieldError, Label } from '../ui/field';
import { Input, Textarea } from '../ui/input';
import { Switch } from '../ui/switch';

type Values = Record<string, string>;

const initial = (overview: ConfigOverview): Values => Object.fromEntries(overview.values.map(entry => [entry.key, entry.value]));

/**
 * The .env settings as one form, a card per group. Only changed keys are sent; secrets start empty and are replaced
 * only when something is typed in (or removed with «Удалить»).
 */
export function ConfigEditor({ overview }: { overview: ConfigOverview }) {
  const [saved, setSaved] = useState(() => initial(overview));
  const [values, setValues] = useState(saved);
  const [secrets, setSecrets] = useState(() => new Set(overview.values.filter(entry => entry.set && isSecret(entry.key)).map(entry => entry.key)));
  const [clear, setClear] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const sources = useMemo(() => new Map(overview.values.map(entry => [entry.key, entry.source])), [overview]);

  const changed = settingDefinitions.filter(definition => definition.type === 'secret'
    ? values[definition.key] !== '' || clear.has(definition.key)
    : values[definition.key] !== saved[definition.key]).map(definition => definition.key);
  const dirty = changed.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update(key: string, value: string) {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => {
      if (!current[key]) return current;
      const { [key]: _, ...rest } = current;
      return rest;
    });
  }

  function reset() {
    setValues(saved);
    setClear(new Set());
    setErrors({});
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const local: Record<string, string> = {};
    for (const key of changed) {
      const definition = settingDefinitions.find(entry => entry.key === key)!;
      const error = settingError(definition, values[key].trim());
      if (error) local[key] = error;
    }
    if (Object.keys(local).length) {
      setErrors(local);
      toast.error('Проверьте выделенные поля.');
      document.getElementById('setting-' + Object.keys(local)[0])?.focus();
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: Object.fromEntries(changed.filter(key => !clear.has(key)).map(key => [key, values[key]])), clear: [...clear] }),
      });
      const reply = await response.json().catch(() => null) as { message?: string; errors?: Record<string, string>; changed?: string[] } | null;
      if (!response.ok) {
        if (reply?.errors) setErrors(reply.errors);
        const messages: Record<number, string> = { 403: 'Изменять конфигурацию может только владелец сайта.' };
        toast.error(typeof reply?.message === 'string' && /[а-яё]/i.test(reply.message) ? reply.message : messages[response.status] ?? 'Не удалось сохранить настройки.');
        return;
      }
      const next = { ...values };
      const nextSecrets = new Set(secrets);
      for (const definition of settingDefinitions) {
        if (definition.type !== 'secret') { next[definition.key] = next[definition.key].trim(); continue; }
        if (clear.has(definition.key)) nextSecrets.delete(definition.key);
        else if (next[definition.key]) nextSecrets.add(definition.key);
        next[definition.key] = '';
      }
      setSaved(next);
      setValues(next);
      setSecrets(nextSecrets);
      setClear(new Set());
      const count = reply?.changed?.length ?? 0;
      toast.success(count ? 'Сохранено: ' + count + ' ' + plural(count) : 'Изменений нет');
      if (count) refreshPage();
    } catch {
      toast.error('Нет связи с сервером. Проверьте подключение.');
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[11rem_minmax(0,1fr)] xl:items-start">
    <nav aria-label="Разделы конфигурации" className="hidden xl:sticky xl:top-6 xl:block">
      <ul className="grid gap-0.5 text-sm">{settingGroups.map(group => <li key={group.id}>
        <a href={'#config-' + group.id} className="block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{group.title}</a>
      </li>)}</ul>
    </nav>

    <div className="grid gap-6 pb-20">
      {!overview.writable && <p role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>Файл <code className="font-mono text-[13px]">{overview.path}</code> недоступен для записи, поэтому сохранить изменения не получится.
          В docker compose он должен быть подключён к nativegallery-api без read_only.</span>
      </p>}

      {settingGroups.map(group => <Card key={group.id} id={'config-' + group.id} className="scroll-mt-6">
        <CardHeader className="block">
          <CardTitle>{group.title}</CardTitle>
          <CardDescription>{group.description}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {settingDefinitions.filter(definition => definition.group === group.id).map(definition =>
            <SettingRow key={definition.key} definition={definition} value={values[definition.key]} saved={saved[definition.key]}
              source={sources.get(definition.key)} error={errors[definition.key]} onChange={value => update(definition.key, value)}
              secretSet={secrets.has(definition.key)} cleared={clear.has(definition.key)}
              onClear={() => { setClear(current => new Set(current).add(definition.key)); update(definition.key, ''); }}
              onKeep={() => setClear(current => { const next = new Set(current); next.delete(definition.key); return next; })} />)}
        </CardContent>
      </Card>)}
    </div>

    <div className={'fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 shadow-[0_-4px_16px_rgb(15_23_42/0.06)] backdrop-blur transition-transform duration-200 motion-reduce:transition-none lg:left-64 '
      + (dirty ? 'translate-y-0' : 'translate-y-full')} aria-hidden={!dirty}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm" role="status">{dirty ? 'Не сохранено: ' + changed.length + ' ' + plural(changed.length) : ''}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={reset} disabled={pending || !dirty} tabIndex={dirty ? 0 : -1}><RotateCcw />Отменить</Button>
          <Button type="submit" disabled={pending || !dirty || !overview.writable} tabIndex={dirty ? 0 : -1}><Save />{pending ? 'Сохранение…' : 'Сохранить'}</Button>
        </div>
      </div>
    </div>
  </form>;
}

function isSecret(key: string) {
  return settingDefinitions.find(entry => entry.key === key)?.type === 'secret';
}

function plural(count: number) {
  const last = count % 10, tens = count % 100;
  if (last === 1 && tens !== 11) return 'настройка';
  if (last >= 2 && last <= 4 && (tens < 12 || tens > 14)) return 'настройки';
  return 'настроек';
}

function SettingRow({ definition, value, saved, source, error, onChange, secretSet, cleared, onClear, onKeep }: {
  definition: SettingDefinition; value: string; saved: string; source?: string; error?: string; onChange: (value: string) => void;
  secretSet: boolean; cleared: boolean; onClear: () => void; onKeep: () => void;
}) {
  const id = 'setting-' + definition.key;
  const describedBy = [definition.description && id + '-description', error && id + '-error'].filter(Boolean).join(' ') || undefined;
  const changed = definition.type === 'secret' ? value !== '' || cleared : value !== saved;
  const common = { id, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy };
  const placeholder = definition.placeholder ?? (definition.default ? 'По умолчанию: ' + definition.default : undefined);

  let control;
  switch (definition.type) {
    case 'boolean':
      control = <Switch {...common} checked={(value || definition.default) === 'true'} onCheckedChange={checked => onChange(checked ? 'true' : 'false')} />;
      break;
    case 'textarea':
      control = <Textarea {...common} value={value} rows={3} placeholder={placeholder} onChange={event => onChange(event.target.value)} />;
      break;
    case 'secret':
      control = <div className="flex gap-2">
        <Input {...common} type="password" autoComplete="new-password" value={value} onChange={event => onChange(event.target.value)}
          placeholder={cleared ? 'Будет удалён при сохранении' : secretSet ? 'Задан. Введите новый, чтобы заменить' : 'Не задан'} />
        {cleared
          ? <Button type="button" variant="outline" onClick={onKeep}>Оставить</Button>
          : secretSet && <Button type="button" variant="ghost-destructive" onClick={onClear}>Удалить</Button>}
      </div>;
      break;
    default:
      control = <Input {...common} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}
        type={definition.type === 'number' ? 'number' : definition.type === 'email' ? 'email' : definition.type === 'url' ? 'url' : 'text'}
        inputMode={definition.type === 'number' ? 'numeric' : undefined} min={definition.min} max={definition.max}
        spellCheck={definition.type === 'text' ? undefined : false} />;
  }

  return <div className={'grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-6 ' + (changed ? 'bg-accent/40' : '')}>
    <div className="grid content-start gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={id}>{definition.label}</Label>
        {changed && <Badge variant="info">Изменено</Badge>}
        {definition.restart && <Badge variant="secondary">После перезапуска</Badge>}
        {source === 'environment' && !changed && <Badge variant="outline" title="Значение задано переменной окружения контейнера, в .env этого ключа нет">Из окружения</Badge>}
        {definition.type === 'secret' && secretSet && !changed && <Badge variant="success"><KeyRound />Задан</Badge>}
      </div>
      {definition.description && <FieldDescription id={id + '-description'}>{definition.description}</FieldDescription>}
      <p className="font-mono text-[11px] text-muted-foreground">{definition.key}{definition.legacy && <span> · ngallery.yaml: {definition.legacy}</span>}</p>
    </div>
    <div className={'grid content-start gap-2 ' + (definition.type === 'boolean' ? 'justify-items-start md:justify-items-end' : '')}>
      {control}
      <FieldError id={id + '-error'}>{error}</FieldError>
    </div>
  </div>;
}
