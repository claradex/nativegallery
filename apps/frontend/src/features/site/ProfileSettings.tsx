import { ProfileForm, ProfileThemeForm } from './ProfileForm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ProfileSettingsData } from '@nativegallery/contracts';

export async function ProfileSettings({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const cookie = (await headers()).get('cookie');
  const response = await fetch(api + '/api/profile/settings', {
    headers: { cookie: cookie ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (response?.status === 403) redirect('/login');
  if (!response?.ok) throw new Error('Could not load profile settings');
  const { type } = await searchParams;
  const data: ProfileSettingsData = await response.json();
  const personalization = type === 'Personalization';
  const theme = cookie?.match(/(?:^|;\s*)NGALLERYTHEME=([^;]+)/)?.[1];
  return <tr><td className="main"><center><div className="tabs">
    <nav className="tab-nav">
      <a href="/lk/profile" className={type === undefined ? 'tab-item active' : 'tab-item'}>Профиль</a>
      <a href="?type=Personalization" className={personalization ? 'tab-item active' : 'tab-item'}>Внешний вид</a>
    </nav>
    <div className="tab-content">{personalization ? <ProfileThemeForm theme={theme} /> : <ProfileForm data={data} />}</div>
  </div></center></td></tr>;
}
