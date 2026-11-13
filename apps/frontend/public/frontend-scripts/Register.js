const form = document.getElementById('form');
const submit = document.getElementById('regbtn');

if (form && submit) {
  const fields = { username: 'err_username', email: 'err_email', password: 'err_password' };
  const errorField = { 2: 'email', 3: 'email', 4: 'password', 5: 'username', 6: 'username', 7: 'username' };

  function showError(field, message) {
    const target = document.getElementById(fields[field]);
    const icon = document.createElement('i');
    icon.className = 'bx bx-error';
    target.replaceChildren(icon, ' ' + message);
  }

  for (const [name, id] of Object.entries(fields)) {
    form.elements.namedItem(name).addEventListener('input', () => document.getElementById(id).replaceChildren());
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    const data = new FormData(form);
    for (const id of Object.values(fields)) document.getElementById(id).replaceChildren();
    const label = submit.value;
    submit.disabled = true;
    submit.value = 'Отправка данных...';
    let redirecting = false;
    try {
      const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(data) });
      if (!response.ok) throw new Error('Registration failed');
      const result = await response.json();
      if (result.error === 0) {
        redirecting = true;
        window.location.assign('/');
      } else {
        showError(errorField[result.errorcode] ?? 'email', result.errortitle ?? 'Не удалось зарегистрироваться.');
      }
    } catch {
      showError('email', 'Не удалось зарегистрироваться. Повторите попытку.');
    } finally {
      if (!redirecting) {
        submit.disabled = false;
        submit.value = label;
      }
    }
  });
}
