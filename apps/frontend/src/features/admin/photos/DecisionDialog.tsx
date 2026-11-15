'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useAction } from '../lib/request';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Field, Label } from '../ui/field';
import { Textarea } from '../ui/input';
import { RadioGroup, RadioTile } from '../ui/radio-group';
import { decide, declineReasons, publishKinds } from './decisions';

/** One rating as a row: its name on the left, plus/minus on the right. */
export function RatingChoice({ name, label, value, onChange }: { name: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="flex items-center justify-between gap-3">
    <span className="text-sm">{label}</span>
    <RadioGroup value={value} onValueChange={onChange} aria-label={label} className="flex gap-1.5">
      <RadioTile value="1" className="px-2.5 py-1">{name}+</RadioTile>
      <RadioTile value="0" className="px-2.5 py-1">{name}−</RadioTile>
    </RadioGroup>
  </div>;
}

/** Both ratings of a published photo. */
export function Ratings({ irate, krate, setIrate, setKrate }: { irate: string; krate: string; setIrate: (value: string) => void; setKrate: (value: string) => void }) {
  return <fieldset className="grid gap-2">
    <legend className="mb-2 text-sm font-medium">Оценка</legend>
    <RatingChoice name="И" label="Информативность" value={irate} onChange={setIrate} />
    <RatingChoice name="К" label="Качество" value={krate} onChange={setKrate} />
  </fieldset>;
}

/** Publishing or declining from a dialog (used where there is no room for the inline panel). */
export function DecisionDialog({ id, mode, trigger, onDone }: { id: number; mode: 'accept' | 'decline'; trigger: ReactNode; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(mode === 'accept' ? '0' : '2');
  const [irate, setIrate] = useState('1');
  const [krate, setKrate] = useState('1');
  const [comment, setComment] = useState('');
  const [pending, run] = useAction();
  const accept = mode === 'accept';

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run(() => decide(id, accept ? 1 : 2, accept ? { reason, irate, krate, comment } : { reason, comment }),
      { success: accept ? 'Фотография опубликована' : 'Фотография отклонена' });
    if (result.ok) { setOpen(false); onDone?.(); }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <form onSubmit={submit} className="grid gap-5">
        <DialogHeader>
          <DialogTitle>{accept ? 'Публикация фотографии' : 'Отклонение фотографии'}</DialogTitle>
          <DialogDescription>{accept ? 'Выберите вид публикации и оценку.' : 'Автор увидит причину и ваш комментарий.'}</DialogDescription>
        </DialogHeader>
        <Field>
          <Label>{accept ? 'Вид публикации' : 'Причина'}</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="gap-1.5">
            {(accept ? publishKinds : declineReasons).map((label, index) =>
              <RadioTile key={label} value={String(accept ? index : index + 1)}>{label}</RadioTile>)}
          </RadioGroup>
        </Field>
        {accept && <Ratings irate={irate} krate={krate} setIrate={setIrate} setKrate={setKrate} />}
        <Field>
          <Label htmlFor={'comment-' + mode + id}>Комментарий автору</Label>
          <Textarea id={'comment-' + mode + id} value={comment} onChange={event => setComment(event.target.value)} rows={3} maxLength={4000} placeholder="Необязательно" />
        </Field>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="submit" variant={accept ? 'success' : 'destructive'} disabled={pending}>{accept ? 'Опубликовать' : 'Отклонить'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
