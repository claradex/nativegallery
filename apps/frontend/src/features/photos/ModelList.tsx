import Link from '../../components/Link';
import { notFound } from 'next/navigation';
import { apiGet, isId } from '../../api/client';
import type { EntityType, ModelListData, ModelListEntry } from '@nativegallery/contracts';
import './ModelList.css';

type TypeSummary = EntityType & { models: number };

function Model({ model }: { model: ModelListEntry }) {
  return <li>
    <Link href={'/vehicle/' + model.id}>{model.title}</Link>
    {model.photos > 0 && <span className="ml-count" title="Фотографий">{model.photos}</span>}
    {model.comment && <span className="ml-comment"> — {model.comment}</span>}
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

function Models({ type, groups }: ModelListData) {
  return <tr><td className="main">
    <h1>{type.title} — список моделей</h1>
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
