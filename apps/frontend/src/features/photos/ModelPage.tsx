import Link from '../../components/Link';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';
import type { ModelPageData } from '@nativegallery/contracts';
import { canEditCatalog, Paragraphs } from './CatalogParts';

function years({ builtFrom, builtTo }: ModelPageData) {
  if (builtFrom && builtTo) return builtFrom === builtTo ? String(builtFrom) : builtFrom + '–' + builtTo;
  if (builtFrom) return 'с ' + builtFrom;
  return builtTo ? 'до ' + builtTo : '';
}

function Cities({ model }: { model: ModelPageData }) {
  const sub = model.withSubmodels ? '' : '&sub=0';
  const count = (total: number, active: number) => <>{total} / {active}</>;
  return <div className="p20">
    <h4>Эксплуатация в городах</h4>
    <p className="sm ct-muted">Через косую черту указано количество всего ПС / только действующего ПС.</p>
    {model.total ? <table className="horlines ct-cities"><tbody>
      <tr><th>Город</th><th>Кол-во</th></tr>
      {model.countries.map((group, index) => [
        <tr key={'c' + index} className="ct-country">
          <td>{group.country ? <Link href={'/list?mid=' + model.id + '&rid=' + group.country.id + sub}>{group.country.title}</Link> : 'Страна не указана'}</td>
          <td className="r">{count(group.total, group.active)}</td>
        </tr>,
        ...group.cities.map((row, cityIndex) => <tr key={index + '-' + cityIndex} className="ct-city">
          <td>{row.city ? <Link href={'/list?mid=' + model.id + '&cid=' + row.city.id + sub}>{row.city.title}</Link> : <span className="ct-muted">Город не указан</span>}</td>
          <td className="r">{count(row.total, row.active)}</td>
        </tr>),
      ])}
      <tr className="ct-country"><td>Всего</td><td className="r"><b>{model.total}</b> / <b>{model.active}</b></td></tr>
    </tbody></table> : <p>ТС этой модели в базе пока нет.</p>}
    <p className="sm">
      {model.children.length > 0 && (model.withSubmodels
        ? <Link href={'/model/' + model.id}>Без подмоделей</Link>
        : <Link href={'/model/' + model.id + '?sub=1'}>Учесть подмодели</Link>)}
    </p>
  </div>;
}

function ModelContent({ model, editable }: { model: ModelPageData; editable: boolean }) {
  const produced = years(model);
  return <tr><td className="main">
    <h1>{model.title}</h1>
    {model.manufacturer && <h4>{model.manufacturer}</h4>}
    <table className="horlines ct-facts"><colgroup><col style={{ width: 190 }} /><col /></colgroup><tbody>
      <tr className="h21"><td className="ds nw">Вид:</td><td className="d"><Link href={'/models?t=' + model.entity.id}>{model.entity.title}</Link></td></tr>
      {model.parent && <tr className="h21"><td className="ds nw">Родительская модель:</td>
        <td className="d"><Link href={'/model/' + model.parent.id}>{model.parent.title}</Link></td></tr>}
      {produced && <tr className="h21"><td className="ds nw">Годы выпуска:</td><td className="d"><b>{produced}</b></td></tr>}
      {model.fields.map(({ label, value }, index) => <tr key={index} className="h21">
        <td className="ds nw">{label}:</td><td className="d"><b><Paragraphs text={value} /></b></td>
      </tr>)}
    </tbody></table>
    <p className="ct-links">
      <Link href={'/models?t=' + model.entity.id + '#m' + model.id}>К списку моделей</Link> · <b><Link href={'/list?mid=' + model.id}>Список подвижного состава</Link></b>
      {editable && <> · <Link href={'/admin?type=ModelEdit&id=' + model.id}>Редактировать</Link></>}
    </p>
    {model.photos.length > 0 && <div className="ct-photos">{model.photos.map(photo => <Link key={photo.id} href={'/photo/' + photo.id + '/'}>
      <img src={'/api/photo/compress?url=' + encodeURIComponent(photo.photourl)} alt="" loading="lazy" />
    </Link>)}</div>}
    {model.description && <div className="p20"><Paragraphs text={model.description} /></div>}
    {model.children.length > 0 && <div className="p20">
      <h4>Подмодели</h4>
      <ul className="straight">{model.children.map(child => <li key={child.id}>
        <Link href={'/model/' + child.id}>{child.title}</Link> <span className="ml-count">{child.vehicles}</span>
      </li>)}</ul>
    </div>}
    <Cities model={model} />
  </td></tr>;
}

export async function ModelPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sub?: string | string[] }> }) {
  const [{ id }, { sub }] = await Promise.all([params, searchParams]);
  if (!isId(id)) notFound();
  const [model, editable] = await Promise.all([
    apiGet<ModelPageData>('/api/internal/model/' + id + (sub === '1' ? '?sub=1' : ''), { missing: true, error: 'Could not load model' }),
    canEditCatalog(),
  ]);
  return <ModelContent model={model} editable={editable} />;
}
