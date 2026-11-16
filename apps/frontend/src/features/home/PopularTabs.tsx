'use client';

import { useState } from 'react';
import Link from '../../components/Link';
import type { HomePhoto } from '@nativegallery/contracts';

interface Tab { key: string; title: string; href: string; photos: HomePhoto[] }

/**
 * «Самые популярные за 24 часа»: as on transphoto.org, every tile shows the photo's comments and its views over the
 * day, and the links under the list reverse it («Наоборот») or switch to «Самые обсуждаемые» when that block is on.
 */
export function PopularTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const [reversed, setReversed] = useState(false);
  const tab = tabs.find(item => item.key === active) ?? tabs[0];
  const photos = reversed ? [...tab.photos].reverse() : tab.photos;
  const choose = (key: string) => { setActive(key); setReversed(false); };

  return <div className="ix-block ix-rankings">
    <h4><Link href={tab.href}>{tab.title}</Link></h4>
    {photos.length ? <div className="pop-list">
      {photos.map(photo => <Link key={photo.id} href={'/photo/' + photo.id} className="prw pop-prw">
        <img width={250} loading="lazy" src={'/api/photo/compress?url=' + encodeURIComponent(photo.photourl)} alt="" />
        <div className="hpshade">
          {photo.comments > 0 && <div className="com-icon">{photo.comments}</div>}
          <div className="eye-icon">+{photo.views}</div>
        </div>
        {photo.priority === 1 && <div className="temp" style={{ backgroundImage: 'url(/static/img/cond.png)' }} />}
      </Link>)}
    </div> : <p className="sm">За последние сутки — пока ничего.</p>}
    <div className="ix-rank-links">
      {photos.length > 1 && <button type="button" onClick={() => setReversed(value => !value)}>{reversed ? 'По порядку' : 'Наоборот'}</button>}
      {tabs.filter(item => item.key !== tab.key).map(item =>
        <button key={item.key} type="button" onClick={() => choose(item.key)}>{item.title}</button>)}
    </div>
  </div>;
}
