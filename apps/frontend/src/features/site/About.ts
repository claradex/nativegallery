import type { SiteOverview } from '@nativegallery/contracts';
import { escapeHtml } from '../../components/Html';

const template = "<!DOCTYPE html>\n<html lang=\"ru\">\n\n<head>\n    __HEAD__\n\n\n</head>\n\n\n<body>\n    <div id=\"backgr\"></div>\n    <table class=\"tmain\">\n        __NAVBAR__\n        <tr>\n            <td class=\"main\">\n                <h1>О сервере <b>__TITLE__</b></h1>\n                <p>__DESCRIPTION__</p>\n                <table width=\"100%\">\n                <div class=\"p20\">\n                        <h4><img src=\"/static/img/go-home.png\">Общая информация</h4>\n                        <ul class=\"straight\">\n                            <li>Зарегистрировано пользователей: <b>__USERS__</b></li>\n                            <li>Опубликовано фотографий: <b>__PHOTOS__</b></li>\n                            <li>Пользователей онлайн: <b>__ONLINE__</b></li>\n                        </ul>\n                    </div>\n                    <div class=\"p20\">\n                        <h4><img src=\"/static/img/220.ico\">Администраторы</h4>\n                        <ul style=\"list-style: none; margin: 0; padding: 0;\">\n                            __STAFF_1__\n                        </ul>\n                    </div>\n                    <div class=\"p20\">\n                        <h4><img src=\"/static/img/248.ico\">Фотомодераторы</h4>\n                        <ul style=\"list-style: none; margin: 0; padding: 0;\">\n                            __STAFF_2__\n                        </ul>\n                    </div>\n                    <div class=\"p20\">\n                        <h4><img src=\"/static/img/152.ico\">Модераторы</h4>\n                        <ul style=\"list-style: none; margin: 0; padding: 0;\">\n                            __STAFF_3__\n                        </ul>\n                    </div>\n                </table>\n\n            </td>\n        </tr>\n        <tr>\n            __FOOTER__\n        </tr>\n    </table>\n\n\n</body>\n\n</html>";

export async function About(api: string) {
  const response = await fetch(api + '/api/internal/about', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return null;
  const data: SiteOverview = await response.json();
  const values: Record<string, string> = {
    TITLE: escapeHtml(process.env.SITE_TITLE ?? 'NativeGallery'),
    DESCRIPTION: escapeHtml(process.env.SITE_DESCRIPTION ?? ''),
    USERS: String(data.users), PHOTOS: String(data.photos), ONLINE: String(data.online),
  };
  for (const role of [1, 2, 3]) {
    values['STAFF_' + role] = data.staff.filter(user => user.admin === role).map(user =>
      '<li><b><a href="/author/' + user.id + '/"><img onerror="this.src = `/static/img/avatar.png`; this.onerror = null;" src="' +
      escapeHtml(user.photourl) + '" width="32" style="border-radius: 3px; margin-right: 5px;">' +
      escapeHtml(user.username) + '</a></b></li>').join('');
  }
  return template.replaceAll(/__(TITLE|DESCRIPTION|USERS|PHOTOS|ONLINE|STAFF_[123])__/g, (_, field) => values[field]);
}
