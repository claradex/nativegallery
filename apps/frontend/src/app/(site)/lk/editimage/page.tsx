import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../../../api/client';

export default async function EditPhoto({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  if (!isId(id)) notFound();
  const photo = await apiGet<{ id: number; place: string; postbody: string }>('/api/account/photos/' + id, {
    auth: true, login: true, missing: true, error: 'Could not load photo editing form',
  });

  return <tr><td className="main">
    <h1>Редактирование фотографии</h1>
    <form method="post" action={'/api/account/photos/' + photo.id} className="p20">
      <table><tbody>
        <tr><td className="lcol"><label htmlFor="place">Место съёмки:</label></td>
          <td><input id="place" name="place" maxLength={255} defaultValue={photo.place} /></td></tr>
        <tr><td className="lcol"><label htmlFor="descr">Описание:</label></td>
          <td><textarea id="descr" name="descr" rows={5} cols={50} defaultValue={photo.postbody} /></td></tr>
      </tbody></table>
      <button type="submit">Сохранить</button>{' '}<a href="/lk/history">Отмена</a>
    </form>
  </td></tr>;
}
