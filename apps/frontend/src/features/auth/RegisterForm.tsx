'use client';

import { useState, type FormEvent } from 'react';

type Field = 'username' | 'email' | 'password';

const errorFields: Partial<Record<string, Field>> = {
  2: 'email', 3: 'email', 4: 'password', 5: 'username', 6: 'username', 7: 'username',
};

function FieldError({ message }: { message?: string }) {
  return message ? <><i className="bx bx-error" />{' ' + message}</> : null;
}

export function RegisterForm({ title }: { title: string }) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  function clearError(field: Field) {
    setErrors(current => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const body = new URLSearchParams();
    for (const [name, value] of new FormData(form)) body.append(name, String(value));
    setErrors({});
    setPending(true);
    let redirecting = false;
    try {
      const response = await fetch(form.action, { method: 'POST', body });
      if (!response.ok) throw new Error('Registration failed');
      const result = await response.json();
      if (result.error === 0) {
        redirecting = true;
        window.location.assign('/');
      } else {
        setErrors({ [errorFields[result.errorcode] ?? 'email']: result.errortitle ?? 'Не удалось зарегистрироваться.' });
      }
    } catch {
      setErrors({ email: 'Не удалось зарегистрироваться. Повторите попытку.' });
    } finally {
      if (!redirecting) setPending(false);
    }
  }

  return <center>
    <h1><b>Регистрация</b></h1>
    <table cellSpacing="10" cellPadding="0" {...{ border: 0, align: 'center' }} style={{ margin: 9 }}><tbody><tr>
      <td><img src="/static/img/logocube.png" style={{ width: 32 }} {...{ align: 'middle' }} /></td>
      <td><b>{title} — это универсальное средство для размещения своих фотографий и видеороликов, созданное на базе движка СТТС.</b><br />
        Публикуйте свои самые лучшие фотографии и великолепные видео на наш портал, чтобы их увидели все желающие.
      </td>
    </tr></tbody></table>
    <div className="mf-center-block">
      <form method="post" action="/api/register" onSubmit={submit} id="form" className="p20i mf-label mf-center-block-wide">
        <input type="hidden" name="accept" value="yes" />
        <div className="styled-input">
          <input type="text" name="username" id="username" onInput={() => clearError('username')} autoComplete="username" required />
          <label htmlFor="username">Ваш никнейм</label>
        </div>
        <div style={{ color: '#e00' }} id="err_username" aria-live="polite"><FieldError message={errors.username} /></div>
        <div className="styled-input">
          <input type="email" name="email" id="email" onInput={() => clearError('email')} autoComplete="email" required />
          <label htmlFor="email">Ваш e-mail</label>
        </div>
        <div style={{ color: '#e00' }} id="err_email" aria-live="polite"><FieldError message={errors.email} /></div>
        <div className="styled-input">
          <input name="password" id="password" onInput={() => clearError('password')} type="password" autoComplete="new-password" required />
          <label htmlFor="password">Ваш пароль</label>
        </div>
        <div style={{ color: '#e00' }} id="err_password" aria-live="polite"><FieldError message={errors.password} /></div>
        <input type="submit" id="regbtn" className="mf-button-wide" style={{ marginTop: 15 }} disabled={pending} value={pending ? 'Отправка данных...' : 'Зарегистрироваться'} />
        <p>Регистрируясь на сервере {title}, вы <a href="/rules">принимаете его правила.</a></p>
        <p><b><a href="/tour">Вы можете пройти экскурсию по сайту.</a></b></p>
      </form><br /><br /><br />
    </div>
  </center>;
}