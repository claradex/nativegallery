'use client';

import { useEffect, useState } from 'react';
import { formatPartialDate, type EntityFieldDef } from '@nativegallery/contracts';
import { Field, FieldDescription, FieldError, Label } from '../ui/field';
import { Input, Textarea } from '../ui/input';

export const datePlaceholder = 'ДД.ММ.ГГГГ, ММ.ГГГГ или ГГГГ';

/** Saved custom values (`{"<key>": {"value": …}}`) as form strings; dates go back to the Russian format. */
export function savedValues(content: string | null | undefined, fields: EntityFieldDef[]) {
  let saved: Record<string, { value?: unknown } | null> = {};
  try { const value = JSON.parse(content ?? '{}'); if (value && typeof value === 'object') saved = value; } catch {}
  return Object.fromEntries(fields.map(field => {
    const value = String(saved[field.key]?.value ?? '');
    return [field.key, field.type === '3' ? formatPartialDate(value) || value : value];
  }));
}

/** Loads an entity's custom fields whenever the chosen entity changes. */
export function useEntityFields(entity: string) {
  const [fields, setFields] = useState<EntityFieldDef[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setFields(null); setError('');
    if (!entity) return;
    const request = new AbortController();
    fetch('/api/admin/models/fields/' + encodeURIComponent(entity), { signal: request.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() as Promise<EntityFieldDef[]>; })
      .then(setFields)
      .catch(() => { if (!request.signal.aborted) setError('Не удалось загрузить поля сущности.'); });
    return () => request.abort();
  }, [entity]);
  return { fields, error };
}

/** Form values for the custom fields of one scope, named the way the API reads them. */
export function fieldBody(fields: EntityFieldDef[] | null, scope: EntityFieldDef['scope'], values: Record<string, string>) {
  return Object.fromEntries((fields ?? []).filter(field => field.scope === scope).map(field => ['modelinput_' + field.key, values[field.key] ?? '']));
}

export function CustomFields({ fields, error, scope, values, onChange }: {
  fields: EntityFieldDef[] | null; error: string; scope: EntityFieldDef['scope'];
  values: Record<string, string>; onChange: (key: string, value: string) => void;
}) {
  if (error) return <FieldError>{error}</FieldError>;
  if (!fields) return <div className="grid gap-3" aria-busy>{[0, 1].map(item => <div key={item} className="h-14 animate-pulse rounded-md bg-muted" />)}</div>;
  const shown = fields.filter(field => field.scope === scope);
  if (!shown.length) return <p className="text-sm text-muted-foreground">
    {scope === 'model' ? 'У сущности нет полей для модели.' : 'У сущности нет своих полей для ТС.'} Их можно добавить в разделе «Сущности».</p>;
  return <>{shown.map(field => {
    const id = 'custom-' + field.key;
    const props = { id, value: values[field.key] ?? '', required: field.required, onChange: (event: { target: { value: string } }) => onChange(field.key, event.target.value) };
    return <Field key={field.key}>
      <Label htmlFor={id}>{field.name}{field.required && <span className="text-destructive" aria-hidden>*</span>}</Label>
      {field.type === '4' ? <Textarea {...props} rows={4} maxLength={10000} />
        : <Input {...props} inputMode={field.type === '2' ? 'decimal' : undefined} maxLength={1000}
          placeholder={field.type === '3' ? datePlaceholder : undefined} pattern={field.type === '2' ? '-?\\d+([.,]\\d+)?' : undefined} />}
      {field.type === '3' && <FieldDescription>Можно указать только год или месяц.</FieldDescription>}
    </Field>;
  })}</>;
}
