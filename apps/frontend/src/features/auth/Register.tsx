import { RegisterForm } from './RegisterForm';
import { apiGet } from '../../api/client';

export async function Register() {
  const { open } = await apiGet<{ open: boolean }>('/api/register/options', { error: 'Could not load registration options' });
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <tr><td className="main">
    {open ? <RegisterForm title={title} /> : <div className="center"><h1>К сожалению, регистрация на сервере {title} закрыта.</h1></div>}
  </td></tr>;
}
