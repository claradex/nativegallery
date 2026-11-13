'use client';

import { useState } from 'react';

export interface VehicleModel { id: number; title: string; color: string }

export function VehicleEditForm({ models }: { models: VehicleModel[] }) {
  const [byName, setByName] = useState(false);
  const [type, setType] = useState(String(models[0]?.id ?? ''));
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');

  return <tr><td className="main">
    <h1>Внесение изменений в БД</h1>
    <p>На этой странице Вы можете ввести данные о Сущности, которые отсутствуют в базе данных сайта, либо требуют уточнения.<br />
      Информация добавляется в базу после проверки редактором.</p>
    <form action="/vehicle/dbedit" id="mform" method="get" className="p20" style={{ float: 'left' }}>
      <input type="hidden" name="action" value="add" />
      <h4>Добавить/редактировать Сущность</h4>
      <table><tbody>
        <tr><td className="lcol">Вид сущности:</td>
          <td><select name="type" id="type" value={type} onChange={event => setType(event.currentTarget.value)}>
            {models.map(model => <option key={model.id} value={model.id} style={{ backgroundColor: model.color }}>{model.title}</option>)}
          </select></td>
        </tr>
        <tr><td className="lcol">
          <input type="radio" name="link_gos" id="link_gos0" value="0" checked={!byName} onChange={() => setByName(false)} />
          <label htmlFor="link_gos0">ID:</label>
        </td><td style={{ paddingRight: 10 }}>
          <input type="text" name="num" id="num" maxLength={20} style={{ width: 80 }} disabled={byName} value={number} onChange={event => setNumber(event.currentTarget.value)} /> &nbsp;
          <input type="radio" name="link_gos" id="link_gos1" value="1" checked={byName} onChange={() => setByName(true)} />
          <label htmlFor="link_gos1">Название:</label>
          <input type="text" name="gos" id="gos" maxLength={20} style={{ width: 120 }} disabled={!byName} value={name} onChange={event => setName(event.currentTarget.value)} />
        </td></tr>
        <tr><td /><td><input type="submit" id="submit" style={{ width: 100, marginTop: 15 }} value="Далее >>" disabled={!type || !(byName ? name : number).trim()} /></td></tr>
      </tbody></table>
      <input type="hidden" name="mid" value="0" />
    </form>
    <br style={{ clear: 'both' }} /><br />
  </td></tr>;
}
