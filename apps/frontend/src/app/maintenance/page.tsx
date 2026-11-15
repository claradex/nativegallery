import { setting } from '@nativegallery/config';
export const dynamic = 'force-dynamic';

/** Shown for every request while MAINTENANCE=true (see src/proxy.ts); unreachable otherwise. */
export default function Maintenance() {
  return <table style={{ width: '100%', height: '100vh' }}><tbody><tr>
    <td style={{ color: '#fff', textAlign: 'center', fontSize: '19pt', fontFamily: 'arial,helvetica,verdana,sans-serif' }}>
      <img src="/static/img/hum.jpg" alt="" /><br /><br />
      Сервер {setting('SITE_TITLE')} временно отключен в связи с техническими работами.
    </td>
  </tr></tbody></table>;
}
