document.getElementById('moderate__block')?.addEventListener('click', async event => {
  const button = event.target.closest?.('[data-decision]');
  const row = button?.closest('[data-request]');
  if (!row || row.dataset.pending) return;
  row.dataset.pending = 'true';
  const buttons = [...row.querySelectorAll('[data-decision]')];
  for (const control of buttons) control.disabled = true;
  try {
    const response = await fetch('/api/admin/models/requests/' + row.dataset.request + '/' + button.dataset.decision, {
      method: 'POST',
    });
    if (!response.ok || (await response.json()).error !== 0) throw new Error();
    row.remove();
  } catch {
    delete row.dataset.pending;
    for (const control of buttons) control.disabled = false;
    window.alert('Не удалось обработать заявку.');
  }
});
