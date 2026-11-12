import { escapeHtml } from './Html';

const markup = "\n\n\n\n<td class=\"footer\">\n            <p>Aloha, Hawaii! | PHP __RUNTIME__ | MySQL __DB__ | Версия __VERSION__</p>\n            <b><a href=\"/\">Главная</a> &nbsp; &nbsp; <a href=\"/lk/\">Личный кабинет</a> &nbsp; &nbsp; <a href=\"/rules\">Правила</a> &nbsp; &nbsp; <a href=\"/about\">О сервере</a></b><br>\n            \n          \n          \n\n\n\n        </td>\n\n";

export function Footer(databaseVersion: string) {
  return markup.replaceAll(/__(RUNTIME|DB|VERSION)__/g, (_, field) => escapeHtml(field === 'RUNTIME' ? process.env.LEGACY_PHP_VERSION ?? '8.3' : field === 'DB' ? databaseVersion : process.env.SITE_REVISION ?? '4ebe9c8'));
}
