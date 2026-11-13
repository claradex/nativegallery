document.getElementById('user-edit')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const body = new URLSearchParams(new FormData(form));
  if (!body.get('accountstatus')) body.delete('accountstatus');
  const status = document.getElementById('user-status');
  button.disabled = true;
  try {
    const response = await fetch(form.action, { method: 'PATCH', body });
    status.className = response.ok ? 'alert alert-success' : 'alert alert-danger';
    status.textContent = response.ok ? 'Данные успешно обновлены' : 'Не удалось сохранить изменения.';
  } catch {
    status.className = 'alert alert-danger';
    status.textContent = 'Не удалось сохранить изменения.';
  } finally {
    button.disabled = false;
    status.hidden = false;
  }
});
