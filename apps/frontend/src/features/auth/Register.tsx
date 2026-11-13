import { RegisterForm } from './RegisterForm';
export async function Register() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/register/options', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load registration options');
  const { open }: { open: boolean } = await response.json();
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <tr><td className="main">
    {open ? <RegisterForm title={title} /> : <center><h1>К сожалению, регистрация на сервере {title} закрыта.</h1></center>}
  </td></tr>;
}
