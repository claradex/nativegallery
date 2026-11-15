import { RegisterForm } from './RegisterForm';
import { apiGet } from '../../api/client';
import { setting } from '@nativegallery/config';

export async function Register() {
  const { open } = await apiGet<{ open: boolean }>('/api/register/options', { error: 'Could not load registration options' });
  const title = setting('SITE_TITLE');
  return <tr><td className="main">
    {open ? <RegisterForm title={title} /> : <div className="center"><h1>К сожалению, регистрация на сервере {title} закрыта.</h1></div>}
  </td></tr>;
}
