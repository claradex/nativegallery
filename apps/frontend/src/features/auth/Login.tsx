import { redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';

function LoginForm() {
  return (
    <form id="form" method="post" className="p20i mf-center-block-wide mf-label">
      <input type="hidden" name="ref" value="/" />
      <div className="styled-input">
        <input type="text" name="username" id="username" required />
        <label htmlFor="username">Имя или Email</label>
      </div>
      <div style={{ color: '#e00' }} id="err_username" />
      <div className="styled-input">
        <input type="password" name="password" id="password" required />
        <label htmlFor="password">Пароль</label>
      </div>
      <div style={{ color: '#e00' }} id="err_password" />
      <input type="button" id="loginbtn" className="mf-button-wide" value="Войти" style={{ marginTop: 15 }} />
    </form>
  );
}

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
    <script src="/frontend-scripts/Login.js" defer />
  </td></tr>;
}
