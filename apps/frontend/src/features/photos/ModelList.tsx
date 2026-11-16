import Link from '../../components/Link';
import { NavbarTheme } from '../../components/NavbarTheme';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';
import type { EntityType, ModelListData, ModelListEntry } from '@nativegallery/contracts';
import './Catalog.css';

type TypeSummary = EntityType & { models: number };

function Model({ model }: { model: ModelListEntry }) {
  return <li id={'m' + model.id}>
    <Link href={'/model/' + model.id}>{model.title}</Link>
    {model.years && <span className="ml-count">{model.years}</span>}
    {model.vehicles > 0 && <> <Link href={'/list?mid=' + model.id} className="ml-count" title="ТС в базе: всего / действующих">{model.vehicles} / {model.active}</Link></>}
    {model.children.length > 0 && <ul>{model.children.map(child => <Model key={child.id} model={child} />)}</ul>}
  </li>;
}

/** `/models` without a type: the entity types to choose from. */
function TypeIndex({ types }: { types: TypeSummary[] }) {
  return <tr><td className="main">
    <h1>Список моделей</h1>
    <div className="p20">
      {types.length ? <ul className="straight">
        {types.map(type => <li key={type.id}>
          <Link href={'/models?t=' + type.id}>{type.title}</Link> <span className="ml-count">{type.models}</span>
        </li>)}
      </ul> : <p>В базе пока нет ни одного вида сущностей.</p>}
    </div>
  </td></tr>;
}

function Models({ type, types, groups }: ModelListData) {
  return <tr><td className="main">
    <NavbarTheme color={type.navColor} />
    <h1>{type.title} — список моделей</h1>
    {types.length > 1 && <p className="ct-filters">{types.map(item => item.id === type.id
      ? <b key={item.id}>{item.title}</b> : <Link key={item.id} href={'/models?t=' + item.id}>{item.title}</Link>)}</p>}
    {groups.length ? groups.map((group, index) => <div key={group.title || index} id={'z' + index} className="p20 ml-group">
      {group.title && <h4>{group.title}</h4>}
      <ul className="straight ml-models">{group.models.map(model => <Model key={model.id} model={model} />)}</ul>
    </div>) : <div className="p20">Моделей этого вида пока нет.</div>}
  </td></tr>;
}

export async function ModelList({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const query = await searchParams;
  const type = Array.isArray(query.t) ? query.t[0] : query.t;
  if (type === undefined) {
    return <TypeIndex types={await apiGet<TypeSummary[]>('/api/internal/models', { error: 'Could not load model types' })} />;
  }
  if (!isId(type)) notFound();
  return <Models {...await apiGet<ModelListData>('/api/internal/models/' + type, { missing: true, error: 'Could not load models' })} />;
}
