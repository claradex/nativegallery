function RegisterForm({ title }: { title: string }) {
  return <center>
    <h1><b>Регистрация</b></h1>
    <table cellSpacing="10" cellPadding="0" {...{ border: 0, align: 'center' }} style={{ margin: 9 }}><tbody><tr>
      <td><img src="/static/img/logocube.png" style={{ width: 32 }} {...{ align: 'middle' }} /></td>
      <td><b>{title} — это универсальное средство для размещения своих фотографий и видеороликов, созданное на базе движка СТТС.</b><br />
        Публикуйте свои самые лучшие фотографии и великолепные видео на наш портал, чтобы их увидели все желающие.
      </td>
    </tr></tbody></table>
    <div className="mf-center-block">
      <form method="post" action="/api/register" id="form" className="p20i mf-label mf-center-block-wide">
        <input type="hidden" name="accept" value="yes" />
        <div className="styled-input">
          <input type="text" name="username" id="username" autoComplete="username" required />
          <label htmlFor="username">Ваш никнейм</label>
        </div>
        <div style={{ color: '#e00' }} id="err_username" aria-live="polite"></div>
        <div className="styled-input">
          <input type="email" name="email" id="email" autoComplete="email" required />
          <label htmlFor="email">Ваш e-mail</label>
        </div>
        <div style={{ color: '#e00' }} id="err_email" aria-live="polite"></div>
        <div className="styled-input">
          <input name="password" id="password" type="password" autoComplete="new-password" required />
          <label htmlFor="password">Ваш пароль</label>
        </div>
        <div style={{ color: '#e00' }} id="err_password" aria-live="polite"></div>
        <input type="submit" id="regbtn" className="mf-button-wide" style={{ marginTop: 15 }} value="Зарегистрироваться" />
        <p>Регистрируясь на сервере {title}, вы <a href="/rules">принимаете его правила.</a></p>
        <p><b><a href="/tour">Вы можете пройти экскурсию по сайту.</a></b></p>
      </form><br /><br /><br />
    </div>
  </center>;
}

export async function Register() {
  const api = process.env.API_ORIGIN ?? 'http://127.0.0.1:3001';
  const response = await fetch(api + '/api/register/options', { cache: 'no-store' }).catch(() => null);
  if (!response?.ok) throw new Error('Could not load registration options');
  const { open }: { open: boolean } = await response.json();
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <tr><td className="main">
    {open ? <RegisterForm title={title} /> : <center><h1>К сожалению, регистрация на сервере {title} закрыта.</h1></center>}
    {open && <script src="/frontend-scripts/Register.js" defer />}
  </td></tr>;
}
