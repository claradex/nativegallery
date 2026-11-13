import { ProfileForm, ProfileThemeForm } from './ProfileForm';
import { type ProfileSettingsData } from '@nativegallery/contracts';
import { apiGet, readCookie, requestCookie } from '../../api/client';

export async function ProfileSettings({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const [data, { type }, cookie] = await Promise.all([
    apiGet<ProfileSettingsData>('/api/profile/settings', { auth: true, login: true, error: 'Could not load profile settings' }),
    searchParams, requestCookie(),
  ]);
  const personalization = type === 'Personalization';
  const theme = readCookie(cookie, 'NGALLERYTHEME');
  return <tr><td className="main"><center><div className="tabs">
    <nav className="tab-nav">
      <a href="/lk/profile" className={type === undefined ? 'tab-item active' : 'tab-item'}>Профиль</a>
      <a href="?type=Personalization" className={personalization ? 'tab-item active' : 'tab-item'}>Внешний вид</a>
    </nav>
    <div className="tab-content">{personalization ? <ProfileThemeForm theme={theme} /> : <ProfileForm data={data} />}</div>
  </div></center></td></tr>;
}
