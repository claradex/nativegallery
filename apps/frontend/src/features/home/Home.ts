import { escapeHtml } from '../../components/Html';
import { legacyDate } from '@nativegallery/contracts';
import { markup, voting, accepting } from './Markup';

interface HomeData {
  popular: { id: number; photourl: string; views: number; priority: number }[];
  random: { id: number; photourl: string; place: string; posted_at: number }[];
  online: { id: number; username: string }[];
  news: { body: string; time: number }[];
  recent: { id: number }[];
  contest: { status: number; theme: string; closedate: number; closepretendsdate: number } | null;
}

export async function Home(api: string): Promise<string | null> {
  const response = await fetch(api + '/api/internal/home', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return null;
  const { popular, random, online, news, recent, contest }: HomeData = await response.json();
  const values: Record<string, string> = {
    POPULAR: popular.map(photo => `<a href="/photo/${photo.id}" class="prw pop-prw">
   <img width="250" src="/api/photo/compress?url=${escapeHtml(photo.photourl)}">
   <div class="hpshade"><div class="eye-icon">+${photo.views}</div></div>${
     photo.priority === 1 ? '<div class="temp" style="background-image:url(/static/img/cond.png)"></div>' : ''
   }</a>`).join(''),
    RANDOM: random.map(photo => {
      const date = legacyDate(photo.posted_at);
      const label = photo.posted_at === 943909200 || date === '30 ноября 1999 в 00:00' ? 'дата не указана' : date;
      const url = escapeHtml(encodeURIComponent(photo.photourl));
      return `<div class="prw-grid-item"><div class="prw-wrapper"><span style="word-spacing:-1px"><b>${escapeHtml(photo.place)}</b></span>
        <div>${label}</div></div>
        <a href="/photo/${photo.id}" class="prw-animate" style='background-image:url("/api/photo/compress?url=${url}")'></a></div>`;
    }).join(''),
    CONTEST: contest ? (contest.status === 2 ? voting : accepting)
      .replace('__CONTEST_TIME__', String(contest.status === 2 ? contest.closedate : contest.closepretendsdate))
      .replace('__CONTEST_THEME__', () => escapeHtml(contest.theme))
      .replace('__SITE_TITLE__', () => escapeHtml(process.env.SITE_TITLE ?? 'NativeGallery')) : '',
    FIRST: String((recent[0]?.id ?? 0) + 1),
    LAST: String(recent.at(-1)?.id ?? ''),
    ONLINE_COUNT: String(online.length),
    ONLINE: online.map(user => `<a href="/author/${user.id}/">${escapeHtml(user.username)}</a>, `).join(''),
    NEWS: news.map(item => `<div class="ix-news-item"><b>${legacyDate(item.time)}</b>
      <div class="break-links" style="padding-top:3px">${item.body}</div></div>`).join(''),
  };
  return markup.replaceAll(/__(POPULAR|RANDOM|CONTEST|FIRST|LAST|ONLINE_COUNT|ONLINE|NEWS)__/g, (_, key) => values[key]);
}
