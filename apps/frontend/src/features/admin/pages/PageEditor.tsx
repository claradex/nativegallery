'use client';

import { Bold, Eye, Image, Italic, Link2, Music, Strikethrough, Underline, Video, type LucideIcon } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { navigate } from '../../../components/navigation';
import { RequestError, send, useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Field, FieldDescription, FieldError, Label } from '../ui/field';
import { Input, Textarea } from '../ui/input';

const formatting: [string, LucideIcon, string][] = [
  ['b', Bold, 'Полужирный'], ['i', Italic, 'Курсив'], ['u', Underline, 'Подчёркнутый'], ['s', Strikethrough, 'Зачёркнутый'], ['a', Link2, 'Ссылка'],
];
type Kind = 'img' | 'video' | 'audio';
const attachments: [Kind, LucideIcon, string, string][] = [
  ['img', Image, 'Изображение', '.jpg,.jpeg,.png,.gif,.webp'], ['video', Video, 'Видео', '.mp4'], ['audio', Music, 'Аудио', '.mp3'],
];

function ToolButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <Button type="button" size="icon-sm" variant="ghost" onClick={onClick} aria-label={label} title={label}><Icon /></Button>;
}

function AttachDialog({ kind, onClose, onInsert }: { kind: Kind | null; onClose: () => void; onInsert: (html: string) => void }) {
  const [address, setAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const meta = attachments.find(([key]) => key === kind);

  async function submit(event: FormEvent) {
    // React submit events bubble through portals, so without this the page form around the editor would submit too.
    event.preventDefault();
    event.stopPropagation();
    if (!kind) return;
    setError('');
    let source: string;
    if (file) {
      const data = new FormData();
      data.append('kind', kind);
      data.append('file', file);
      setBusy(true);
      try {
        source = (await send<{ url: string }>('/api/admin/pages/attachments', { body: data, fallback: 'Не удалось загрузить файл. Проверьте формат и размер (до 32 МБ).' })).url;
      } catch (reason) {
        setError(reason instanceof RequestError ? reason.message : 'Не удалось загрузить файл.');
        return;
      } finally {
        setBusy(false);
      }
    } else {
      try {
        const url = new URL(address);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
        source = url.href;
      } catch {
        setError('Выберите файл или укажите адрес, начинающийся с http:// или https://.');
        return;
      }
    }
    const element = document.createElement(kind);
    element.setAttribute('src', source);
    if (kind === 'img') element.setAttribute('alt', '');
    else { element.setAttribute('controls', ''); element.setAttribute('preload', 'metadata'); }
    onInsert(element.outerHTML);
  }

  return <Dialog open={!!kind} onOpenChange={open => { if (!open && !busy) onClose(); if (open) { setAddress(''); setFile(null); setError(''); } }}>
    <DialogContent onOpenAutoFocus={() => { setAddress(''); setFile(null); setError(''); }}>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader>
          <DialogTitle>Вставить: {meta?.[2].toLowerCase()}</DialogTitle>
          <DialogDescription>Загрузите файл или вставьте ссылку на уже размещённый.</DialogDescription>
        </DialogHeader>
        <Field><Label htmlFor="attach-file">Файл</Label>
          <Input id="attach-file" type="file" accept={meta?.[3]} onChange={event => setFile(event.target.files?.[0] ?? null)} className="py-1.5 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium" />
          <FieldDescription>Форматы: {meta?.[3].replaceAll('.', ' ').trim().replaceAll(' ', ', ')}. До 32 МБ.</FieldDescription>
        </Field>
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground"><span className="h-px flex-1 bg-border" />или<span className="h-px flex-1 bg-border" /></div>
        <Field><Label htmlFor="attach-url">Адрес</Label>
          <Input id="attach-url" type="url" inputMode="url" placeholder="https://" value={address} onChange={event => setAddress(event.target.value)} disabled={!!file} />
        </Field>
        <FieldError>{error}</FieldError>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Отмена</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Загрузка…' : 'Вставить'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

export function PageEditor({ page }: { page?: { id: number; title: string; body: string } }) {
  const [title, setTitle] = useState(page?.title ?? '');
  const [body, setBody] = useState(page?.body ?? '');
  const [attach, setAttach] = useState<Kind | null>(null);
  const [preview, setPreview] = useState<{ title: string; html: string } | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const [pending, run] = useAction();
  const [previewing, runPreview] = useAction();

  function replaceSelection(text: string, select?: (start: number) => [number, number]) {
    const field = area.current;
    if (!field) return;
    const { selectionStart, selectionEnd } = field;
    field.focus();
    field.setRangeText(text, selectionStart, selectionEnd, 'end');
    setBody(field.value);
    if (select) { const [from, to] = select(selectionStart); field.setSelectionRange(from, to); }
  }

  function wrap(tag: string) {
    const field = area.current;
    if (!field) return;
    const selected = field.value.slice(field.selectionStart, field.selectionEnd);
    const opening = tag === 'a' ? '<a href="">' : '<' + tag + '>';
    replaceSelection(opening + selected + '</' + tag + '>', start => {
      const from = start + (tag === 'a' ? '<a href="'.length : opening.length);
      return [from, tag === 'a' ? from : from + selected.length];
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => page
      ? send('/api/admin/pages/' + page.id, { method: 'PATCH', body: { title, bodypost: body }, fallback: 'Не удалось сохранить страницу.' })
      : send('/api/admin/pages', { body: { title, bodypost: body }, fallback: 'Не удалось опубликовать страницу.' }),
    { success: page ? 'Страница сохранена' : 'Страница опубликована', refresh: false });
    if (result.ok) navigate('/admin?type=Pages', { refresh: true });
  }

  async function showPreview() {
    const result = await runPreview(() => send<{ title: string; html: string }>('/api/admin/pages/preview',
      { body: { title, bodypost: body }, fallback: 'Не удалось открыть предпросмотр: заполните заголовок и текст.' }), { refresh: false });
    if (result.ok) setPreview(result.result);
  }

  return <>
    <form onSubmit={submit}>
      <Card>
        <CardContent className="grid gap-5 py-5">
          <Field><Label htmlFor="page-title">Заголовок</Label>
            <Input id="page-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={255} required className="h-10 text-base font-medium" /></Field>
          <Field>
            <Label htmlFor="page-body">Текст</Label>
            <div className="overflow-hidden rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
              <div role="toolbar" aria-label="Оформление" className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-1.5 py-1">
                {formatting.map(([tag, icon, label]) => <ToolButton key={tag} icon={icon} label={label} onClick={() => wrap(tag)} />)}
                <span aria-hidden className="mx-1.5 h-5 w-px bg-border" />
                {attachments.map(([kind, icon, label]) => <ToolButton key={kind} icon={icon} label={'Вставить: ' + label.toLowerCase()} onClick={() => setAttach(kind)} />)}
              </div>
              <textarea ref={area} id="page-body" value={body} onChange={event => setBody(event.target.value)} required rows={18}
                placeholder="Текст страницы. Можно использовать HTML."
                className="block w-full resize-y bg-card px-3 py-2.5 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground" />
            </div>
            <FieldDescription>Сервер очищает HTML: скрипты и опасные атрибуты не сохранятся. Проверьте результат в предпросмотре.</FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="justify-between">
          <Button type="button" variant="outline" onClick={showPreview} disabled={previewing || !title.trim() || !body.trim()}><Eye />Предпросмотр</Button>
          <Button type="submit" disabled={pending}>{page ? 'Сохранить' : 'Опубликовать'}</Button>
        </CardFooter>
      </Card>
    </form>
    <AttachDialog kind={attach} onClose={() => setAttach(null)} onInsert={html => { setAttach(null); requestAnimationFrame(() => replaceSelection(html)); }} />
    <Dialog open={!!preview} onOpenChange={open => { if (!open) setPreview(null); }}>
      <DialogContent wide>
        <DialogHeader><DialogTitle>{preview?.title}</DialogTitle><DialogDescription>Так страница будет выглядеть после очистки HTML.</DialogDescription></DialogHeader>
        <div className="admin-prose rounded-md border bg-card p-4" dangerouslySetInnerHTML={{ __html: preview?.html ?? '' }} />
      </DialogContent>
    </Dialog>
  </>;
}
