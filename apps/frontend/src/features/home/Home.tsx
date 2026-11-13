import { Fragment } from 'react';
import { legacyDate } from '@nativegallery/contracts';
import { NewsItem } from '../site/NewsPage';
import { HomeContest } from './HomeContest';

interface HomeData {
  popular: { id: number; photourl: string; views: number; priority: number }[];
  random: { id: number; photourl: string; place: string; posted_at: number }[];
  online: { id: number; username: string }[];
  news: { body: string; time: number }[];
  recent: { id: number }[];
  contest: { status: number; theme: string; closedate: number; closepretendsdate: number } | null;
}

const homeStyle = ".ix-country {\n        padding-top: 3px;\n        white-space: nowrap;\n        font-family: var(--narrow-font);\n        font-size: 18px;\n    }\n\n    .ix-country>a>b {\n        border-bottom: dotted 1px;\n    }\n\n    .ix-cities {\n        padding: 5px 0 15px 15px;\n    }\n\n    .ix-arrow {\n        display: inline-block;\n        width: 9px;\n        height: 9px;\n        background: url(\"/img/arrow_blue.png\") no-repeat;\n        transition: transform .1s ease-out;\n        position: relative;\n        top: -1px;\n    }\n\n    .ix-arrow.ix-arrow-expanded {\n        transform: rotate(90deg);\n    }";
const contestStyle = "#contestNotify {\n                                    background-size: 550px 211.2px;\n                                    background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewbox=\"0 0 550 211.2\" width=\"550\" height=\"211.2\" style=\"opacity: 0.3; filter: grayscale(0);\"><text x=\"0em\" y=\"1em\" font-size=\"88\" transform=\"rotate(17 55 52.8)\">🎁</text><text x=\"1.25em\" y=\"2em\" font-size=\"88\" transform=\"rotate(17 165 140.8)\">🎈</text><text x=\"2.5em\" y=\"1em\" font-size=\"88\" transform=\"rotate(17 275 52.8)\">🎀</text><text x=\"3.75em\" y=\"2em\" font-size=\"88\" transform=\"rotate(17 385 140.8)\">🎊</text><text x=\"5em\" y=\"1em\" font-size=\"88\" transform=\"rotate(17 495 52.8)\">🎉</text></svg>');\n                                }";

function RandomPhoto({ photo }: { photo: HomeData['random'][number] }) {
  const date = legacyDate(photo.posted_at);
  const label = photo.posted_at === 943909200 || date === '30 ноября 1999 в 00:00' ? 'дата не указана' : date;
  const thumbnail = '/api/photo/compress?url=' + encodeURIComponent(photo.photourl);
  return <div className="prw-grid-item">
    <div className="prw-wrapper">
      <span style={{ wordSpacing: -1 }}><b>{photo.place}</b></span><div>{label}</div>
    </div>
    <a href={'/photo/' + photo.id} className="prw-animate" style={{ backgroundImage: 'url("' + thumbnail + '")' }}></a>
  </div>;
}

function HomeContent({ popular, random, online, news, recent, contest }: HomeData) {
  return (
  <tr>
    <td className="main">
        <style>{homeStyle}</style>
        <table id="idx-main"><tbody>
            <tr>
                <td style={{ verticalAlign: 'top', paddingRight: 20 }}>
                    <h4><a href="/top30">Самые популярные за 24 часа</a></h4>
                    <div>
                        {popular.map(photo => <a key={photo.id} href={'/photo/' + photo.id} className="prw pop-prw">
                          <img width={250} loading="lazy" src={'/api/photo/compress?url=' + photo.photourl} />
                          <div className="hpshade"><div className="eye-icon">+{photo.views}</div></div>
                          {photo.priority === 1 && <div className="temp" style={{ backgroundImage: 'url(/static/img/cond.png)' }} />}
                        </a>)}
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ width: 250 }}></div>
                    </div>
                </td>
                <td style={{ verticalAlign: 'top', width: '70%', paddingTop: 4 }}>
                    <h4><a href="/photo/">Случайные фотографии</a></h4>
                    <div id="random-photos" className="ix-photos ix-photos-oneline">
                        {random.map(photo => <RandomPhoto key={photo.id} photo={photo} />)}
                    </div>
                    <style>{contestStyle}</style>
                    {contest && <HomeContest contest={contest} />}
                    <br />
                    <h4 style={{ clear: 'both' }}><a href="/update">Недавно добавленные фотографии</a></h4>
                    <div id="recent-photos" className="ix-photos ix-photos-multiline shine" {...{ lastpid: String((recent[0]?.id ?? 0) + 1), firstpid: String(recent.at(-1)?.id ?? '') }}>
                    </div>
                    <div style={{ textAlign: 'center', margin: '10px 0' }}><input type="button" name="button" id="loadmore" className="" value="Загрузить ещё" /></div>
                    <h4>Сейчас на сайте ({online.length})</h4>
                    <div>
                        {online.map(user => <Fragment key={user.id}><a href={'/author/' + user.id + '/'}>{user.username}</a>{', '}</Fragment>)}
                    </div>
                </td>
                <td style={{ paddingLeft: 20, width: 254, verticalAlign: 'top' }}>
                    <h4>Новости сайта</h4>
                    <div className="sm" style={{ marginBottom: 15, lineHeight: '13px', whiteSpace: 'normal' }}>
                        {news.map((item, index) => <NewsItem key={index} body={item.body} time={item.time} />)}
                    </div>
                </td>
            </tr>
        </tbody></table>
        <script src="/frontend-scripts/RecentPhotos.js" defer />
    </td>
</tr>
  );
}

export async function Home() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/internal/home', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load the home page');
  const data: HomeData = await response.json();
  return <HomeContent {...data} />;
}
