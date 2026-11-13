import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface VehicleModel { id: number; title: string; color: string }

function VehicleEditForm({ models }: { models: VehicleModel[] }) {
  return <tr><td className="main">
    <h1>Внесение изменений в БД</h1>
    <p>На этой странице Вы можете ввести данные о Сущности, которые отсутствуют в базе данных сайта, либо требуют уточнения.<br />
      Информация добавляется в базу после проверки редактором.</p>
    <form action="/vehicle/dbedit" id="mform" method="get" className="p20" style={{ float: 'left' }}>
      <input type="hidden" name="action" value="add" />
      <h4>Добавить/редактировать Сущность</h4>
      <table><tbody>
        <tr><td className="lcol">Вид сущности:</td>
          <td><select name="type" id="type">
            {models.map(model => <option key={model.id} value={model.id} style={{ backgroundColor: model.color }}>{model.title}</option>)}
          </select></td>
        </tr>
        <tr><td className="lcol">
          <input type="radio" name="link_gos" id="link_gos0" value="0" defaultChecked />
          <label htmlFor="link_gos0">ID:</label>
        </td><td style={{ paddingRight: 10 }}>
          <input type="text" name="num" id="num" maxLength={20} style={{ width: 80 }} /> &nbsp;
          <input type="radio" name="link_gos" id="link_gos1" value="1" />
          <label htmlFor="link_gos1">Название:</label>
          <input type="text" name="gos" id="gos" maxLength={20} style={{ width: 120 }} disabled />
        </td></tr>
        <tr><td /><td><input type="submit" id="submit" style={{ width: 100, marginTop: 15 }} value="Далее >>" disabled /></td></tr>
      </tbody></table>
      <input type="hidden" name="mid" value="0" />
    </form>
    <br style={{ clear: 'both' }} /><br />
    <script src="/frontend-scripts/VehicleEdit.js" defer />
  </td></tr>;
}

export async function VehicleEdit() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/vehicle-models', {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load vehicle data');
  const models: VehicleModel[] = await response.json();
  return <VehicleEditForm models={models} />;
}
