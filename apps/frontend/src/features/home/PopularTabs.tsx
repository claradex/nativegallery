'use client';

import { useState } from 'react';
import Link from '../../components/Link';
import type { HomePhoto } from '@nativegallery/contracts';

interface Tab { key: string; title: string; href: string; photos: HomePhoto[] }

/**
 * «Самые популярные за 24 часа» / «Самые обсуждаемые»: the left column's rankings, switched like transphoto's tabs,
 * with «Наоборот» reversing the current list.
 */
export function PopularTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const [reversed, setReversed] = useState(false);
  const tab = tabs.find(item => item.key === active) ?? tabs[0];
  const photos = reversed ? [...tab.photos].reverse() : tab.photos;
  const counter = tab.key === 'discussed' ? 'com-icon' : 'eye-icon';

  return <div className="ix-block ix-rankings">
    <h4><Link href={tab.href}>{tab.title}</Link></h4>
    <div className="ix-tabs sm">
      {tabs.length > 1 && tabs.map(item => item.key === tab.key ? null
        : <button key={item.key} type="button" onClick={() => { setActive(item.key); setReversed(false); }}>{item.title}</button>)}
      {photos.length > 1 && <button type="button" onClick={() => setReversed(value => !value)}>{reversed ? 'По порядку' : 'Наоборот'}</button>}
    </div>
    {photos.length ? <div className="pop-list">
      {photos.map(photo => <Link key={photo.id} href={'/photo/' + photo.id} className="prw pop-prw">
        <img width={250} loading="lazy" src={'/api/photo/compress?url=' + encodeURIComponent(photo.photourl)} alt="" />
        <div className="hpshade"><div className={counter}>+{photo.count}</div></div>
        {photo.priority === 1 && <div className="temp" style={{ backgroundImage: 'url(/static/img/cond.png)' }} />}
      </Link>)}
    </div> : <p className="sm">За последние сутки — пока ничего.</p>}
  </div>;
}
