import { ProfileForm, ProfileThemeForm } from './ProfileForm';
import { ProfileSessions } from './ProfileSessions';
import type { ProfileSession, ProfileSettingsData } from '@nativegallery/contracts';
import { apiGet, readCookie, requestCookie } from '../../api/client';

const tabs = [[undefined, 'Профиль'], ['Security', 'Безопасность'], ['Personalization', 'Внешний вид']] as const;

export async function ProfileSettings({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const { type } = await searchParams;
  const load = { auth: true, login: true, error: 'Could not load profile settings' };
  let content;
  if (type === 'Security') content = <ProfileSessions sessions={await apiGet<ProfileSession[]>('/api/profile/sessions', load)} />;
  else {
    // The settings request also sends guests to the login page for the personalization tab.
    const [data, cookie] = await Promise.all([apiGet<ProfileSettingsData>('/api/profile/settings', load), requestCookie()]);
    content = type === 'Personalization' ? <ProfileThemeForm theme={readCookie(cookie, 'NGALLERYTHEME')} /> : <ProfileForm data={data} />;
  }
  return <tr><td className="main"><center><div className="tabs">
    <nav className="tab-nav">{tabs.map(([tab, label]) =>
      <a key={label} href={tab ? '?type=' + tab : '/lk/profile'} className={type === tab ? 'tab-item active' : 'tab-item'}>{label}</a>)}
    </nav>
    <div className="tab-content">{content}</div>
  </div></center></td></tr>;
}
