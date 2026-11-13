import { LoginForm } from './LoginForm';
import { redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';



function LoginContent() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1><b>Авторизация</b></h1>
      <div className="mf-center-block mf-label">
        <LoginForm />
        <div style={{ marginTop: 15 }}><a href="/register" className="mf-button">Регистрация</a></div>
      </div>
      <br />
    </div>
  );
}

export async function Login() {
  if ((await siteContext()).viewer) redirect('/');
  return <tr><td className="main">
    <LoginContent />
  </td></tr>;
}
