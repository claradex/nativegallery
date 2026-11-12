import { readTemplate } from './ReadTemplate';
import type { Viewer } from '@nativegallery/contracts';
import { escapeHtml } from './Html';

const nav = readTemplate('src/components/Navbar.html');
const guest = readTemplate('src/components/GuestMenu.html');
const member = readTemplate('src/components/MemberMenu.html');
const verification = readTemplate('src/components/EmailVerification.html');
const admin = readTemplate('src/components/AdminMenuItem.html');
const upload = readTemplate('src/components/UploadMenuItem.html');

function notice(count: number) {
  return count > 0 ? '<span class="mm-notify notify-count">' + count + '</span>' : '';
}

export function Navbar(path: string, title: string, viewer: Viewer | null) {
  const photo = path.split('/')[1] === 'photo';
  const hidden = 'style="display: none;"';
  const verify = process.env.EMAIL_VERIFY === 'true' && viewer?.status === 3;
  const values: Record<string, string> = {
    VERIFY: verify ? verification : '', HIDE_SMALL: photo ? '' : hidden, HIDE_LARGE: photo ? hidden : '',
    LOGO: escapeHtml(process.env.SITE_LOGO ?? '/static/img/logosmall.png'),
    TITLE: process.env.SITE_SHOW_TITLE === 'false' ? '' : escapeHtml(title), UNREAD: notice(viewer?.unreadPhotos ?? 0),
    ACCOUNT: viewer ? member.replaceAll(/__(ID|USERNAME|PENDING|ADMIN|UPLOAD)__/g, (_, key) => {
      switch (key) {
        case 'ID': return String(viewer.id);
        case 'USERNAME': return escapeHtml(viewer.username);
        case 'PENDING': return notice(viewer.pendingPhotos);
        case 'ADMIN': return viewer.admin > 0 ? admin.replace('__PENDING__', notice(viewer.pendingPhotos)) : '';
        default: return verify ? '' : upload;
      }
    }) : guest,
  };
  return nav.replaceAll(/__(\w+)__/g, (_, field) => values[field] ?? '');
}
