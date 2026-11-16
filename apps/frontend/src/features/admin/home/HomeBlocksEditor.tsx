'use client';

import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, Save, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import Link from '../../../components/Link';
import {
  homeBlockVisibilities, homeColumns, type HomeBlockSettings, type HomeBlockVisibility, type HomeColumn,
} from '@nativegallery/contracts';
import { send, useAction } from '../lib/request';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Field, FieldDescription, Label } from '../ui/field';
import { Input, Textarea } from '../ui/input';

const visibilityIcons = { all: Eye, users: UserRound, none: EyeOff } as const;
const visibilityBadge = { all: 'success', users: 'info', none: 'secondary' } as const;

type Draft = Pick<HomeBlockSettings, 'key' | 'column' | 'visibility' | 'customTitle' | 'body' | 'defaultTitle' | 'description'>;

function VisibilityPicker({ value, onChange, label }: { value: HomeBlockVisibility; onChange: (value: HomeBlockVisibility) => void; label: string }) {
  return <div className="flex w-fit rounded-md bg-muted p-0.5 text-[13px]" role="radiogroup" aria-label={'Кому виден блок «' + label + '»'}>
    {homeBlockVisibilities.map(item => {
      const Icon = visibilityIcons[item.id];
      return <button key={item.id} type="button" role="radio" aria-checked={value === item.id} onClick={() => onChange(item.id)}
        className={'flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors [&>svg]:size-3.5 ' +
          (value === item.id ? 'bg-card font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
        <Icon />{item.label}</button>;
    })}
  </div>;
}

function BlockRow({ block, first, last, update, move }: {
  block: Draft; first: boolean; last: boolean;
  update: (patch: Partial<Draft>) => void; move: (offset: -1 | 1) => void;
}) {
  const title = block.customTitle || block.defaultTitle;
  return <li className={'grid gap-3 px-5 py-4 ' + (block.visibility === 'none' ? 'bg-muted/30' : '')}>
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
      <div className="flex flex-col gap-0.5">
        <Button size="icon-sm" variant="ghost" disabled={first} onClick={() => move(-1)} aria-label={'Поднять «' + title + '»'}><ArrowUp /></Button>
        <Button size="icon-sm" variant="ghost" disabled={last} onClick={() => move(1)} aria-label={'Опустить «' + title + '»'}><ArrowDown /></Button>
      </div>
      <div className="min-w-0 flex-1 basis-56">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          <span className={block.visibility === 'none' ? 'text-muted-foreground line-through' : ''}>{title}</span>
          <Badge variant={visibilityBadge[block.visibility]}>{homeBlockVisibilities.find(item => item.id === block.visibility)?.label}</Badge>
        </p>
        <p className="text-[13px] text-muted-foreground">{block.description}</p>
      </div>
      <VisibilityPicker value={block.visibility} onChange={visibility => update({ visibility })} label={title} />
    </div>
    <div className="grid gap-3 pl-0 sm:pl-12">
      <Field>
        <Label htmlFor={'home-title-' + block.key} className="text-[13px] text-muted-foreground">Заголовок</Label>
        <Input id={'home-title-' + block.key} value={block.customTitle} maxLength={255} placeholder={block.defaultTitle}
          onChange={event => update({ customTitle: event.target.value })} />
      </Field>
      {block.key === 'custom' && <Field>
        <Label htmlFor="home-custom-body" className="text-[13px] text-muted-foreground">HTML блока</Label>
        <Textarea id="home-custom-body" value={block.body} rows={6} className="font-mono text-[13px]"
          placeholder={'<a href="https://t.me/…"><img src="/static/img/banner.png" alt="Наше сообщество"></a>'}
          onChange={event => update({ body: event.target.value })} />
        <FieldDescription>Ссылки, изображения, списки. Скрипты и опасные атрибуты сервер вырежет. Пустой блок не показывается.</FieldDescription>
      </Field>}
    </div>
  </li>;
}

/** «Главная страница»: who sees each block, its order inside its column, headings and the custom block's HTML. */
export function HomeBlocksEditor({ blocks: initial }: { blocks: HomeBlockSettings[] }) {
  const toDrafts = (list: HomeBlockSettings[]): Draft[] => list.map(({ key, column, visibility, customTitle, body, defaultTitle, description }) =>
    ({ key, column, visibility, customTitle, body, defaultTitle, description }));
  const [blocks, setBlocks] = useState(() => toDrafts(initial));
  const [pending, run] = useAction();
  const saved = useMemo(() => JSON.stringify(toDrafts(initial)), [initial]);
  const dirty = JSON.stringify(blocks) !== saved;

  const update = (key: string, patch: Partial<Draft>) => setBlocks(list => list.map(block => block.key === key ? { ...block, ...patch } : block));
  const move = (column: HomeColumn, key: string, offset: -1 | 1) => setBlocks(list => {
    const own = list.filter(block => block.column === column);
    const index = own.findIndex(block => block.key === key);
    const target = own[index + offset];
    if (!target) return list;
    const next = [...list];
    const a = next.findIndex(block => block.key === key), b = next.findIndex(block => block.key === target.key);
    [next[a], next[b]] = [next[b], next[a]];
    return next;
  });

  async function save() {
    const payload = blocks.map(({ key, visibility, customTitle, body }) => ({ key, visibility, title: customTitle, body: key === 'custom' ? body : undefined }));
    await run(() => send('/api/admin/home-blocks', { method: 'PUT', body: { blocks: JSON.stringify(payload) }, fallback: 'Не удалось сохранить главную страницу.' }),
      { success: 'Главная страница сохранена' });
  }

  const counts = homeBlockVisibilities.map(item => ({ ...item, count: blocks.filter(block => block.visibility === item.id).length }));

  return <div className="grid gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2 text-[13px] text-muted-foreground">
        {counts.map(item => <span key={item.id}><Badge variant={visibilityBadge[item.id]}>{item.count}</Badge> {item.label.toLowerCase()}</span>)}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild><Link href="/" target="_blank">Открыть главную</Link></Button>
        <Button variant="ghost" disabled={!dirty || pending} onClick={() => setBlocks(toDrafts(initial))}><RotateCcw />Сбросить</Button>
        <Button disabled={!dirty || pending} onClick={save}><Save />Сохранить</Button>
      </div>
    </div>
    {homeColumns.map(column => {
      const own = blocks.filter(block => block.column === column.id);
      return <Card key={column.id}>
        <CardHeader><div><CardTitle>{column.label}</CardTitle>
          <CardDescription>{column.id === 'left' ? 'Узкая колонка слева: рейтинги фотографий за сутки.'
            : column.id === 'right' ? 'Узкая колонка справа: новости сайта и свой HTML.' : 'Основная часть страницы.'}</CardDescription></div></CardHeader>
        <ul className="divide-y">{own.map((block, index) => <BlockRow key={block.key} block={block} first={index === 0} last={index === own.length - 1}
          update={patch => update(block.key, patch)} move={offset => move(column.id, block.key, offset)} />)}</ul>
      </Card>;
    })}
  </div>;
}
