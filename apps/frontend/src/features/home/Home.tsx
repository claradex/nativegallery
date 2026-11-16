import Link from '../../components/Link';
import './Home.css';
import './HomeContest.css';
import { apiGet } from '../../api/client';
import { RecentPhotos } from './RecentPhotos';
import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { legacyDate, type HomeColumn, type HomeData } from '@nativegallery/contracts';
import { NewsItem } from '../site/NewsPage';
import { HomeContest } from './HomeContest';
import { PopularTabs } from './PopularTabs';
import { setting } from '@nativegallery/config';

type Block = HomeData['blocks'][number];

const thumbnail = (url: string) => '/api/photo/compress?url=' + encodeURIComponent(url);
const places = ['', 'I', 'II', 'III'];

function RandomPhoto({ photo }: { photo: HomeData['random'][number] }) {
  const date = legacyDate(photo.posted_at);
  const label = photo.posted_at === 943909200 || date === '30 ноября 1999 в 00:00' ? 'дата не указана' : date;
  return <div className="prw-grid-item">
    <div className="prw-wrapper">
      <span style={{ wordSpacing: -1 }}><b>{photo.place}</b></span><div>{label}</div>
    </div>
    <Link href={'/photo/' + photo.id} className="prw-animate" style={{ backgroundImage: 'url("' + thumbnail(photo.photourl) + '")' }}></Link>
  </div>;
}

function ContestWinner({ winner }: { winner: NonNullable<HomeData['contestWinner']> }) {
  return <div className="ix-winner">
    <h4><Link href="/voting/results">Фотоконкурс</Link></h4>
    <Link href={'/photo/' + winner.photoId} className="prw ix-winner-photo">
      <img width={250} loading="lazy" src={thumbnail(winner.photourl)} alt="" />
    </Link>
    <div className="sm"><b>{places[winner.place] ?? winner.place} место</b>{winner.theme && <> · {winner.theme}</>}</div>
  </div>;
}

function VehicleSearch({ types }: { types: HomeData['vehicleTypes'] }) {
  if (!types.length) return <p className="sm">В базе пока нет видов транспорта.</p>;
  return <ul className="ix-types">
    {types.map(type => <li key={type.id}>
      <Link href={'/models?t=' + type.id}>{type.title}</Link>
      {type.vehicles > 0 && <span className="ix-count" title="ТС в базе">{type.vehicles}</span>}
    </li>)}
  </ul>;
}

function TransportNews({ items }: { items: HomeData['transportNews'] }) {
  if (!items.length) return <p className="sm">Новостей пока нет.</p>;
  return <div className="ix-tnews">
    {items.map(item => <div key={item.id} className="ix-tnews-item">
      <div className="ix-tnews-head">{item.city && <b>{item.city}, </b>}<span>{legacyDate(item.time).replace(/ в \d\d:\d\d$/, '')}</span></div>
      <div className="break-links" dangerouslySetInnerHTML={{ __html: item.body }} />
    </div>)}
    <p className="sm"><Link href="/news?kind=1">Все новости транспорта</Link></p>
  </div>;
}

function Discussions({ items }: { items: HomeData['discussions'] }) {
  if (!items.length) return <p className="sm">Комментариев пока нет.</p>;
  return <div className="ix-talk">
    {items.map(item => <div key={item.id} className="ix-talk-item">
      <Link href={'/photo/' + item.photoId} className="ix-talk-thumb" style={{ backgroundImage: 'url("' + thumbnail(item.photourl) + '")' }} aria-label={item.place} />
      <div>
        <div className="ix-talk-head"><Link href={'/photo/' + item.photoId}><b>{item.place || 'Фото № ' + item.photoId}</b></Link>
          {' · '}<Link href={'/author/' + item.authorId + '/'}>{item.author}</Link>{' · '}<span>{legacyDate(item.postedAt)}</span></div>
        <div className="ix-talk-body">{item.body}</div>
      </div>
    </div>)}
    <p className="sm"><Link href="/comments">Все комментарии</Link></p>
  </div>;
}

function Daily({ places }: { places: HomeData['daily'] }) {
  if (!places.length) return <p className="sm">За последние сутки новых фотографий нет.</p>;
  return <div className="ix-daily">
    {places.map(place => <div key={place.place}>
      <b>{place.place}:</b>{' '}
      {place.items.map((item, index) => <Fragment key={item.title + index}>
        {index > 0 && ', '}<Link href={item.href}>{item.title}</Link> <span className="ix-plus">+{item.count}</span>
      </Fragment>)}
    </div>)}
    <p className="sm"><Link href="/update">Архив обновлений</Link></p>
  </div>;
}

function BlockView({ block, data }: { block: Block; data: HomeData }): ReactNode {
  const titled = (href: string | null, children: ReactNode, style?: CSSProperties) => <div className="ix-block" style={style}>
    <h4>{href ? <Link href={href}>{block.title}</Link> : block.title}</h4>
    {children}
  </div>;
  switch (block.key) {
    case 'contest':
      if (data.contest) return <div className="ix-block" style={{ overflow: 'hidden' }}><HomeContest title={setting('SITE_TITLE')} contest={data.contest} /></div>;
      return data.contestWinner ? <ContestWinner winner={data.contestWinner} /> : null;
    case 'random':
      return titled('/photo/', <div id="random-photos" className="ix-photos ix-photos-oneline">
        {data.random.map(photo => <RandomPhoto key={photo.id} photo={photo} />)}</div>, { clear: 'both' });
    case 'vehicleSearch': return titled('/models', <VehicleSearch types={data.vehicleTypes} />, { clear: 'both' });
    case 'recent':
      return titled('/update', <RecentPhotos lastId={(data.recent[0]?.id ?? 0) + 1} firstId={data.recent.at(-1)?.id} />, { clear: 'both' });
    case 'transportNews': return titled('/news?kind=1', <TransportNews items={data.transportNews} />);
    case 'discussions': return titled('/comments', <Discussions items={data.discussions} />);
    case 'daily': return titled('/update', <Daily places={data.daily} />);
    case 'online':
      return <div className="ix-block"><h4>{block.title} ({data.online.length})</h4>
        <div>{data.online.map((user, index) => <Fragment key={user.id}>{index > 0 && ', '}<Link href={'/author/' + user.id + '/'}>{user.username}</Link></Fragment>)}</div>
      </div>;
    case 'siteNews':
      return titled('/news', <div className="sm" style={{ lineHeight: '13px', whiteSpace: 'normal' }}>
        {data.siteNews.map(item => <NewsItem key={item.id} body={item.body} time={item.time} />)}</div>);
    case 'custom':
      return block.body ? <div className="ix-block">{block.title && <h4>{block.title}</h4>}
        <div className="break-links ix-custom" dangerouslySetInnerHTML={{ __html: block.body }} /></div> : null;
    default: return null;
  }
}

/** The left column's photo rankings: one list, or tabs when both «популярные» and «обсуждаемые» are on. */
function Rankings({ blocks, data }: { blocks: Block[]; data: HomeData }) {
  const tabs = blocks.flatMap(block => block.key === 'popular' || block.key === 'discussed'
    ? [{ key: block.key, title: block.title, photos: block.key === 'popular' ? data.popular : data.discussed,
      href: block.key === 'popular' ? '/top30' : '/comments' }] : []);
  return tabs.length ? <PopularTabs tabs={tabs} /> : null;
}

function Column({ column, blocks, data }: { column: HomeColumn; blocks: Block[]; data: HomeData }) {
  const own = blocks.filter(block => block.column === column);
  let rankingsShown = false;
  return own.map(block => {
    if (block.key === 'popular' || block.key === 'discussed') {
      if (rankingsShown) return null;
      rankingsShown = true;
      return <Rankings key="rankings" blocks={own} data={data} />;
    }
    return <Fragment key={block.key}><BlockView block={block} data={data} /></Fragment>;
  });
}

function HomeContent(data: HomeData) {
  const has = (column: HomeColumn) => data.blocks.some(block => block.column === column);
  return <tr>
    <td className="main">
      <table id="idx-main"><tbody>
        <tr>
          {has('left') && <td style={{ verticalAlign: 'top', paddingRight: 20, width: 254 }}>
            <Column column="left" blocks={data.blocks} data={data} />
          </td>}
          <td style={{ verticalAlign: 'top', paddingTop: 4 }}>
            <Column column="center" blocks={data.blocks} data={data} />
          </td>
          {has('right') && <td style={{ paddingLeft: 20, width: 254, verticalAlign: 'top' }}>
            <Column column="right" blocks={data.blocks} data={data} />
          </td>}
        </tr>
      </tbody></table>
    </td>
  </tr>;
}

export async function Home() {
  const data = await apiGet<HomeData>('/api/internal/home', { auth: true, error: 'Could not load the home page' });
  return <HomeContent {...data} />;
}
