'use client';

import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function login(form: HTMLFormElement) {
    if (pending) return;
    const data = new FormData(form);
    const username = String(data.get('username') ?? '').trim();
    const password = String(data.get('password') ?? '').trim();
    setUsernameError(username ? '' : 'Поле не заполнено');
    setPasswordError(password ? '' : 'Поле не заполнено');
    if (!username || !password) return;

    setPending(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: new URLSearchParams({ username, password, remember: 'false' }),
      });
      if (!response.ok) throw new Error('Login request failed');
      const result = await response.json();
      if (result.errorcode === '0') {
        window.location.assign('/');
        return;
      }
      setPasswordError('Неверно указаны логин и/или пароль');
    } catch {
      setPasswordError('Не удалось отправить запрос. Попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void login(event.currentTarget);
  }

  return (
    <form id="form" method="post" onSubmit={submit} className="p20i mf-center-block-wide mf-label">
      <input type="hidden" name="ref" value="/" />
      <div className="styled-input">
        <input type="text" name="username" id="username" required onInput={() => { setUsernameError(''); setPasswordError(''); }} />
        <label htmlFor="username">Имя или Email</label>
      </div>
      <div style={{ color: '#e00' }} id="err_username">{usernameError}</div>
      <div className="styled-input">
        <input type="password" name="password" id="password" required onInput={() => setPasswordError('')} />
        <label htmlFor="password">Пароль</label>
      </div>
      <div style={{ color: '#e00' }} id="err_password">{passwordError}</div>
      <input type="button" id="loginbtn" className="mf-button-wide" disabled={pending} value={pending ? 'Отправка данных...' : 'Войти'} onClick={event => { if (event.currentTarget.form) void login(event.currentTarget.form); }} style={{ marginTop: 15 }} />
    </form>
  );
}