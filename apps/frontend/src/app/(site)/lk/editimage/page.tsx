import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export default async function EditPhoto({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  if (typeof id !== 'string' || !/^\d{1,10}$/.test(id)) notFound();
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/account/photos/' + id, {
    headers: { cookie: (await headers()).get('cookie') ?? '' }, cache: 'no-store',
  });
  if (response.status === 403) redirect('/login');
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Could not load photo editing form');
  const photo: { id: number; place: string; postbody: string } = await response.json();

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
