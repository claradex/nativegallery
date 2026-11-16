'use client';

import { CheckCircle2, CircleAlert, Loader2, Pencil, Plug, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import {
  storageKindById, storageKindDefinitions, storagePublishModes,
  type StorageField, type StorageKind, type StoragePublishMode, type StorageTargetData, type StorageTestResult,
} from '@nativegallery/contracts';
import { RequestError, send, useAction } from '../lib/request';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, Textarea } from '../ui/input';
import { Switch } from '../ui/switch';
import { KindIcon } from './KindIcon';

interface Draft {
  title: string;
  kind: StorageKind;
  mode: StoragePublishMode;
  enabled: boolean;
  config: Record<string, string>;
  /** Stored secrets the owner chose to remove. */
  cleared: string[];
}

function initial(target?: StorageTargetData): Draft {
  return target
    ? { title: target.title, kind: target.kind, mode: target.mode, enabled: target.enabled, config: { ...target.config }, cleared: [] }
    : { title: '', kind: 'disk', mode: 'all', enabled: true, config: {}, cleared: [] };
}

function ConfigField({ field, value, stored, cleared, onChange, onClear }: {
  field: StorageField; value: string; stored: boolean; cleared: boolean; onChange: (value: string) => void; onClear: (cleared: boolean) => void;
}) {
  const id = 'storage-' + field.key;
  if (field.type === 'boolean') {
    return <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-2.5">
      <div className="grid gap-1">
        <Label htmlFor={id}>{field.label}</Label>
        {field.description && <FieldDescription>{field.description}</FieldDescription>}
      </div>
      <Switch id={id} checked={value === 'true'} onCheckedChange={checked => onChange(checked ? 'true' : '')} />
    </div>;
  }
  const long = field.type === 'secret' && field.key === 'serviceAccount';
  const placeholder = field.type === 'secret' && stored && !cleared ? 'Сохранён — оставьте пустым, чтобы не менять' : field.placeholder;
  return <Field>
    <Label htmlFor={id}>{field.label}{field.required && <span className="text-destructive" aria-hidden>*</span>}</Label>
    {long
      ? <Textarea id={id} value={value} rows={4} className="font-mono text-xs" placeholder={placeholder ?? '{"type": "service_account", …}'}
        onChange={event => onChange(event.target.value)} spellCheck={false} />
      : <Input id={id} type={field.type === 'secret' ? 'password' : field.type === 'url' ? 'url' : 'text'} value={value} placeholder={placeholder}
        autoComplete={field.type === 'secret' ? 'new-password' : 'off'} spellCheck={false} onChange={event => onChange(event.target.value)} />}
    {field.description && <FieldDescription>{field.description}</FieldDescription>}
    {field.type === 'secret' && stored && <label className="flex w-fit items-center gap-2 text-[13px] text-muted-foreground">
      <input type="checkbox" checked={cleared} onChange={event => onClear(event.target.checked)} className="size-3.5 accent-destructive" />
      Удалить сохранённое значение
    </label>}
  </Field>;
}

/** Adds a storage, or (with `target`) edits one: the kind's settings, a connection test and the publication mode. */
export function StorageEditor({ target }: { target?: StorageTargetData }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => initial(target));
  const [test, setTest] = useState<StorageTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [pending, run] = useAction();
  const kind = storageKindById.get(draft.kind)!;

  const update = (patch: Partial<Draft>) => { setDraft(value => ({ ...value, ...patch })); setTest(null); };
  const setConfig = (key: string, value: string) => update({ config: { ...draft.config, [key]: value } });

  /** Secret fields: empty keeps what is stored, null clears it. */
  function payload() {
    const config: Record<string, string | null> = {};
    for (const field of kind.fields) config[field.key] = draft.cleared.includes(field.key) ? null : draft.config[field.key] ?? '';
    return JSON.stringify(config);
  }

  async function check() {
    setTesting(true);
    try {
      setTest(await send<StorageTestResult>('/api/admin/storage/test', {
        body: { id: target?.id, kind: draft.kind, config: payload() }, fallback: 'Не удалось проверить подключение.',
      }));
    } catch (error) {
      setTest({ ok: false, message: error instanceof RequestError ? error.message : 'Не удалось проверить подключение.', milliseconds: 0 });
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    const body = { title: draft.title, kind: draft.kind, mode: draft.mode, enabled: draft.enabled, config: payload() };
    const result = await run(() => target
      ? send('/api/admin/storage/' + target.id, { method: 'PUT', body, fallback: 'Не удалось сохранить хранилище.' })
      : send('/api/admin/storage', { body, fallback: 'Не удалось добавить хранилище.' }),
    { success: target ? 'Хранилище сохранено' : 'Хранилище добавлено' });
    if (result.ok) setOpen(false);
  }

  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setDraft(initial(target)); setTest(null); } }}>
    <DialogTrigger asChild>
      {target ? <Button variant="outline" size="sm"><Pencil />Изменить</Button> : <Button><Plus />Добавить хранилище</Button>}
    </DialogTrigger>
    <DialogContent wide>
      <DialogHeader>
        <DialogTitle>{target ? 'Хранилище «' + target.title + '»' : 'Новое хранилище'}</DialogTitle>
        <DialogDescription>{kind.description}</DialogDescription>
      </DialogHeader>
      <form className="grid gap-5" onSubmit={event => { event.preventDefault(); void save(); }}>
        {!target && <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">Тип</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
            {storageKindDefinitions.map(item => <button key={item.id} type="button" role="radio" aria-checked={draft.kind === item.id}
              onClick={() => update({ kind: item.id, config: {}, cleared: [] })}
              className={cn('flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors',
                draft.kind === item.id ? 'border-primary bg-accent font-medium text-accent-foreground ring-2 ring-primary/20' : 'hover:bg-muted')}>
              <KindIcon kind={item.id} className="size-5" />{item.label}
            </button>)}
          </div>
        </fieldset>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="storage-title">Название<span className="text-destructive" aria-hidden>*</span></Label>
            <Input id="storage-title" value={draft.title} maxLength={255} required placeholder={kind.label + ': резервная копия'}
              onChange={event => update({ title: event.target.value })} />
          </Field>
          <Field>
            <span className="text-sm leading-none font-medium">Что публиковать</span>
            <div className="flex rounded-md bg-muted p-0.5 text-[13px]" role="radiogroup" aria-label="Что публиковать">
              {storagePublishModes.map(mode => <button key={mode.id} type="button" role="radio" aria-checked={draft.mode === mode.id} title={mode.description}
                onClick={() => update({ mode: mode.id })}
                className={cn('flex-1 rounded px-2.5 py-1.5 transition-colors', draft.mode === mode.id ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
                {mode.label}</button>)}
            </div>
            <FieldDescription>{storagePublishModes.find(mode => mode.id === draft.mode)?.description}</FieldDescription>
          </Field>
        </div>

        <div className="grid gap-4">
          {kind.fields.map(field => <ConfigField key={draft.kind + field.key} field={field} value={draft.config[field.key] ?? ''}
            stored={!!target?.secrets.includes(field.key)} cleared={draft.cleared.includes(field.key)}
            onChange={value => setConfig(field.key, value)}
            onClear={cleared => update({ cleared: cleared ? [...draft.cleared, field.key] : draft.cleared.filter(key => key !== field.key) })} />)}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2.5">
          <div className="grid gap-1">
            <Label htmlFor="storage-enabled">Публиковать в это хранилище</Label>
            <FieldDescription>Выключенное хранилище не получает новые файлы и не проверяется по расписанию.</FieldDescription>
          </div>
          <Switch id="storage-enabled" checked={draft.enabled} onCheckedChange={enabled => update({ enabled })} />
        </div>

        {test && <p role="status" className={cn('flex items-start gap-2 rounded-md px-3 py-2.5 text-[13px]',
          test.ok ? 'bg-success/10 text-success' : 'bg-destructive/8 text-destructive')}>
          {test.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}
          <span className="break-words">{test.message}{test.milliseconds > 0 && <span className="opacity-70"> ({(test.milliseconds / 1000).toFixed(1)} с)</span>}</span>
        </p>}

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={check} disabled={testing || pending}>
            {testing ? <Loader2 className="animate-spin" /> : <Plug />}Проверить подключение
          </Button>
          <Button type="submit" disabled={pending || !draft.title.trim()}><Save />{target ? 'Сохранить' : 'Добавить'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
