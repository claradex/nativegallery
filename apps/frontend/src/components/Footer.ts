import { readTemplate } from './ReadTemplate';
import { escapeHtml } from './Html';

const markup = readTemplate('src/components/Footer.html');

export function Footer(databaseVersion: string) {
  return markup.replaceAll(/__(RUNTIME|DB|VERSION)__/g, (_, field) => escapeHtml(field === 'RUNTIME' ? process.env.LEGACY_PHP_VERSION ?? '8.3' : field === 'DB' ? databaseVersion : process.env.SITE_REVISION ?? '4ebe9c8'));
}
