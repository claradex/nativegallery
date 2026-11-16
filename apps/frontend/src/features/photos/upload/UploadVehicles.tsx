'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  formatPartialDate, maxPhotoVehicles, statusClass, vehicleAngle, vehicleAngles,
  type CityRef, type UploadVehicleLink, type UploadVehicleMatch,
} from '@nativegallery/contracts';
import './UploadVehicles.css';

type Entity = { id: number; title: string; color: string };
type Bound = UploadVehicleLink & { match: UploadVehicleMatch };
type Search = { state: 'idle' } | { state: 'loading' } | { state: 'error' } | { state: 'done'; matches: UploadVehicleMatch[]; number: string };

const cityLabel = (city: CityRef) => city.title + (city.country ? ', ' + city.country.title : '');

function years(match: UploadVehicleMatch) {
  const built = formatPartialDate(match.built), retired = formatPartialDate(match.retired);
  if (!built && !retired) return '';
  return (built || '?') + ' — ' + (retired || '…');
}

/**
 * Compass of angles round a vehicle seen from above, front to the right: each arrow points at the side it was shot
 * from (1 = front, then clockwise).
 */
const compass: { angle: number; arrow: string; area: string }[] = [
  { angle: 4, arrow: '↘', area: 'a' }, { angle: 3, arrow: '↓', area: 'b' }, { angle: 2, arrow: '↙', area: 'c' },
  { angle: 5, arrow: '→', area: 'd' }, { angle: 1, arrow: '←', area: 'e' },
  { angle: 6, arrow: '↗', area: 'f' }, { angle: 7, arrow: '↑', area: 'g' }, { angle: 8, arrow: '↖', area: 'h' },
];

function AnglePicker({ value, onChange, onClose }: { value: number; onChange: (angle: number) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (box.current && !box.current.contains(event.target as Node)) onClose(); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [onClose]);
  const pick = (angle: number) => { onChange(angle); onClose(); };
  return <div className="uv-angles shadow" ref={box} role="dialog" aria-label="Ракурс">
    <div className="uv-compass">
      <label className="uv-view" style={{ gridArea: 't' }}><input type="checkbox" checked={value === 9} onChange={() => pick(value === 9 ? 0 : 9)} /> Вид сверху</label>
      {compass.map(item => <button key={item.angle} type="button" style={{ gridArea: item.area }} title={vehicleAngle(item.angle).label}
        className={'uv-arrow' + (value === item.angle ? ' active' : '')} aria-pressed={value === item.angle} onClick={() => pick(item.angle)}>
        <span className="uv-dot" />{item.arrow}</button>)}
      <div className="uv-car" style={{ gridArea: 'v' }} aria-hidden><span className="uv-rear" /><span className="uv-front" /></div>
      <label className="uv-view" style={{ gridArea: 'u' }}><input type="checkbox" checked={value === 10} onChange={() => pick(value === 10 ? 0 : 10)} /> Вид снизу</label>
    </div>
    <div className="uv-special">
      {vehicleAngles.filter(angle => angle.id === 0 || angle.id >= 11).map(angle => <label key={angle.id}>
        <input type="radio" name="uv-angle" checked={value === angle.id} onChange={() => pick(angle.id)} />{' '}
        <span className={value === angle.id ? 'uv-current' : undefined}>{angle.label}</span>
      </label>)}
    </div>
  </div>;
}

function MatchCard({ match, cities, onPick }: { match: UploadVehicleMatch; cities: boolean; onPick: () => void }) {
  return <button type="button" className={'uv-match ' + statusClass(match.status)} onClick={onPick}>
    <span className="uv-col">
      <b className="uv-num">{match.number}</b>
      {cities && match.city && <span>{match.city.title}</span>}
      {match.note && <span className="uv-note">{match.note}</span>}
    </span>
    <span className="uv-col uv-model">{match.model?.title ?? <i>модель не указана</i>}</span>
    <span className="uv-col uv-depot">
      {match.depot && <span>{match.depot.title}</span>}
      {years(match) && <span>{years(match)}</span>}
    </span>
  </button>;
}

function BoundCard({ item, index, count, onChange, onRemove, onMove }: {
  item: Bound; index: number; count: number;
  onChange: (patch: Partial<UploadVehicleLink>) => void; onRemove: () => void; onMove: (by: number) => void;
}) {
  const [picking, setPicking] = useState(false);
  const { match } = item;
  return <div className={'uv-bound ' + statusClass(match.status)}>
    <div className="uv-col">
      <a className="uv-num" href={'/vehicle/' + match.id + '/'} target="_blank">{match.number}</a>
      <span>{match.city?.title ?? ''}</span>
    </div>
    <div className="uv-col uv-model">{match.model?.title ?? <i>модель не указана</i>}</div>
    <div className="uv-fields">
      <label>Маршрут: <input type="text" value={item.route} maxLength={16} onChange={event => onChange({ route: event.target.value })} style={{ width: 50 }} /></label>
      <input type="text" value={item.note} maxLength={255} placeholder="примечание" aria-label="Примечание" onChange={event => onChange({ note: event.target.value })} style={{ width: 170 }} />
      <span className="uv-angle-wrap">Ракурс:{' '}
        <button type="button" className={'uv-angle-link' + (item.angle ? '' : ' unset')} onClick={() => setPicking(open => !open)} aria-expanded={picking}>
          {vehicleAngle(item.angle).label}</button>
        {picking && <AnglePicker value={item.angle} onChange={angle => onChange({ angle })} onClose={() => setPicking(false)} />}
      </span>
    </div>
    <div className="uv-tools">
      {count > 1 && <>
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} title="Левее" aria-label="Левее">◀</button>
        <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} title="Правее" aria-label="Правее">▶</button>
      </>}
      <button type="button" className="uv-remove" onClick={onRemove} title="Отвязать" aria-label={'Отвязать ' + match.number}>✕</button>
    </div>
  </div>;
}

/** Step 2 of the upload form: find vehicles by city, kind and board number and bind them left to right. */
export function UploadVehicles({ entities, cities }: { entities: Entity[]; cities: CityRef[] }) {
  const [cityText, setCityText] = useState('');
  const [entity, setEntity] = useState(entities[0] ? String(entities[0].id) : '');
  const [number, setNumber] = useState('');
  const [search, setSearch] = useState<Search>({ state: 'idle' });
  const [bound, setBound] = useState<Bound[]>([]);
  const request = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const city = cities.find(item => cityLabel(item) === cityText.trim() || item.title === cityText.trim());

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (search.state !== 'done') return;
    const outside = (event: MouseEvent) => { if (list.current && !list.current.contains(event.target as Node)) setSearch({ state: 'idle' }); };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [search.state]);

  async function find() {
    const query = number.trim();
    if (!query || !entity) return;
    request.current?.abort();
    const current = new AbortController();
    request.current = current;
    setSearch({ state: 'loading' });
    try {
      const params = new URLSearchParams({ type: entity, q: query, ...(city ? { city: String(city.id) } : {}) });
      const response = await fetch('/api/upload/entities?' + params, { signal: current.signal, cache: 'no-store' });
      if (!response.ok) throw new Error();
      const matches = await response.json() as UploadVehicleMatch[];
      if (!current.signal.aborted) setSearch({ state: 'done', matches, number: query });
    } catch {
      if (!current.signal.aborted) setSearch({ state: 'error' });
    }
  }

  function pick(match: UploadVehicleMatch) {
    setBound(list => list.some(item => item.id === match.id) || list.length >= maxPhotoVehicles ? list
      : [...list, { id: match.id, route: '', note: '', angle: 0, match }]);
    if (!city && match.city) setCityText(cityLabel(match.city));
    setSearch({ state: 'idle' });
    setNumber('');
  }

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); find(); }
    if (event.key === 'Escape') setSearch({ state: 'idle' });
  };
  const update = (id: number, patch: Partial<UploadVehicleLink>) => setBound(list => list.map(item => item.id === id ? { ...item, ...patch } : item));
  const move = (index: number, by: number) => setBound(list => {
    const copy = [...list];
    [copy[index], copy[index + by]] = [copy[index + by], copy[index]];
    return copy;
  });
  const color = entities.find(item => String(item.id) === entity)?.color;
  const request_href = '/vehicle/dbedit?' + new URLSearchParams({ type: entity, ...(number.trim() ? { num: number.trim() } : {}), ...(city ? { city: String(city.id) } : {}) });
  const value = JSON.stringify(bound.map(({ id, route, note, angle }) => ({ id, route: route.trim(), note: note.trim(), angle })));

  return <>
    <tr className="lnk-vehicle"><td className="lcol"><label htmlFor="uv-city">Город:</label></td><td style={{ paddingRight: 15 }}>
      <input type="text" id="uv-city" list="uv-cities" value={cityText} onChange={event => setCityText(event.target.value)} autoComplete="off"
        placeholder="любой" style={{ width: 290, height: 22 }} aria-invalid={!!cityText.trim() && !city} />
      <datalist id="uv-cities">{cities.map(item => <option key={item.id} value={cityLabel(item)} />)}</datalist>
      {cityText.trim() && !city && <span className="sm uv-hint"> такого города нет в базе — поиск по всем городам</span>}
    </td></tr>
    <tr className="lnk-vehicle"><td className="lcol"><label htmlFor="search_type">Вид транспорта:</label></td><td style={{ paddingRight: 15 }}>
      <select id="search_type" className="uv-type" value={entity} style={{ backgroundColor: color || undefined }}
        onChange={event => { setEntity(event.target.value); setSearch({ state: 'idle' }); }}>
        {entities.map(item => <option key={item.id} value={item.id} style={{ backgroundColor: item.color }}>{item.title}</option>)}
      </select>
    </td></tr>
    <tr className="lnk-vehicle"><td className="lcol"><label htmlFor="search_num">Бортовой №:</label></td><td style={{ paddingRight: 15 }}>
      <div className="uv-search" ref={list}>
        <input type="text" id="search_num" value={number} onChange={event => setNumber(event.target.value)} onKeyDown={onKey}
          maxLength={64} autoComplete="off" style={{ width: 150, height: 22 }} />
        <input type="button" className="searchVehiclesBtn" value="Найти в БД" onClick={find}
          disabled={!number.trim() || !entity || search.state === 'loading'} style={{ height: 22, paddingTop: 0, position: 'relative', left: -1 }} />
        {search.state === 'loading' && <span className="sm uv-hint"> ищем…</span>}
        {search.state === 'error' && <span className="sm uv-error"> не удалось выполнить поиск</span>}
        {search.state === 'done' && <div className="uv-results shadow" role="listbox" aria-label="Найденные ТС">
          {!search.matches.length && <div className="uv-empty">ТС с номером <b>{search.number}</b> {city ? 'в городе ' + city.title + ' ' : ''}не найдено.</div>}
          {search.matches.map(match => <MatchCard key={match.id} match={match} cities={!city} onPick={() => pick(match)} />)}
          <a className="uv-create" href={request_href} target="_blank">Предложить новое ТС для базы…</a>
        </div>}
      </div>
    </td></tr>
    <tr className="lnk-vehicle"><td className="lcol" style={{ verticalAlign: 'top', paddingTop: 12 }}>Привязка:</td><td style={{ paddingRight: 15, paddingTop: 6 }}>
      <input type="hidden" name="vehicles" value={value} />
      {bound.length ? <div className="uv-bound-list">{bound.map((item, index) => <BoundCard key={item.id} item={item} index={index} count={bound.length}
        onChange={patch => update(item.id, patch)} onRemove={() => setBound(list => list.filter(other => other.id !== item.id))} onMove={by => move(index, by)} />)}</div>
        : <span className="sm uv-hint">Нет — найдите ТС по номеру и выберите его в списке.</span>}
      <p className="sm uv-hint" style={{ marginTop: 6 }}>Если на фото несколько ТС, привяжите их по порядку слева направо.
        {bound.length >= maxPhotoVehicles && ' Больше ' + maxPhotoVehicles + ' привязать нельзя.'}</p>
    </td></tr>
  </>;
}
