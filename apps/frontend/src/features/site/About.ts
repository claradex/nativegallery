import type { SiteOverview } from '@nativegallery/contracts';
import { escapeHtml } from '../../components/Html';

import { readTemplate } from '../../components/ReadTemplate';

export async function About(api: string) {
  const response = await fetch(api + '/api/internal/about', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) return null;
  const [data, template, staffTemplate]: [SiteOverview, string, string] = await Promise.all([
    response.json(), readTemplate('src/features/site/About.html'), readTemplate('src/features/site/StaffMember.html'),
  ]);
  const values: Record<string, string> = {
    TITLE: escapeHtml(process.env.SITE_TITLE ?? 'NativeGallery'),
    DESCRIPTION: escapeHtml(process.env.SITE_DESCRIPTION ?? ''),
    USERS: String(data.users), PHOTOS: String(data.photos), ONLINE: String(data.online),
  };
  for (const role of [1, 2, 3]) {
    values['STAFF_' + role] = data.staff.filter(user => user.admin === role).map(user => {
      const fields: Record<string, string> = {
        ID: String(user.id), AVATAR: escapeHtml(user.photourl), USERNAME: escapeHtml(user.username),
      };
      return staffTemplate.replaceAll(/__(ID|AVATAR|USERNAME)__/g, (_, field) => fields[field]);
    }).join('');
  }
  return template.replaceAll(/__(TITLE|DESCRIPTION|USERS|PHOTOS|ONLINE|STAFF_[123])__/g, (_, field) => values[field]);
}
