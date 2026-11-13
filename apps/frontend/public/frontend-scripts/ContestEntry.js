document.getElementById('contest-entry')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type="submit"]');
  if (button.disabled) return;
  button.disabled = true;
  try {
    const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
    if (!response.ok || (await response.json()).errorcode !== 0) throw new Error();
    location.assign('/voting/waiting');
  } catch {
    document.getElementById('contest-entry-status').textContent = 'Не удалось отправить фотографию на конкурс.';
    button.disabled = false;
  }
});
