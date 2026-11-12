const form = document.querySelector('#form');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const submit = document.querySelector('#loginbtn');
const usernameError = document.querySelector('#err_username');
const passwordError = document.querySelector('#err_password');

username?.addEventListener('input', () => {
  usernameError.textContent = '';
  passwordError.textContent = '';
});
password?.addEventListener('input', () => { passwordError.textContent = ''; });

async function login(event) {
  event.preventDefault();
  if (submit.disabled) return;
  const name = username.value.trim();
  const secret = password.value.trim();
  usernameError.textContent = name ? '' : 'Поле не заполнено';
  passwordError.textContent = secret ? '' : 'Поле не заполнено';
  if (!name || !secret) return;

  submit.disabled = true;
  submit.value = 'Отправка данных...';
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: new URLSearchParams({
        username: name, password: secret, remember: String(Boolean(document.querySelector('#remember')?.checked)),
      }),
    });
    if (!response.ok) throw new Error('Login request failed');
    const data = await response.json();
    if (data.errorcode === '0') {
      window.location.assign('/');
      return;
    }
    passwordError.textContent = 'Неверно указаны логин и/или пароль';
  } catch {
    passwordError.textContent = 'Не удалось отправить запрос. Попробуйте ещё раз.';
  } finally {
    submit.disabled = false;
    submit.value = 'Войти';
  }
}

submit?.addEventListener('click', login);
form?.addEventListener('submit', login);
