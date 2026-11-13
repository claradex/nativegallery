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
    const badge = document.getElementById('mdlnum');
    if (badge) {
      const count = document.querySelectorAll('[data-request]').length;
      if (count) badge.textContent = String(count);
      else badge.remove();
    }
  } catch {
    delete row.dataset.pending;
    for (const control of buttons) control.disabled = false;
    window.alert('Не удалось обработать заявку.');
  }
});

document.getElementById('list__block')?.addEventListener('click', async event => {
  const button = event.target.closest?.('button[data-model-delete]');
  if (!button || button.disabled || !window.confirm('Удалить модель?')) return;
  button.disabled = true;
  try {
    const response = await fetch('/api/admin/models/catalog/' + button.dataset.modelDelete, { method: 'DELETE' });
    if (response.ok) {
      button.closest('tr')?.remove();
      return;
    }
    if (response.status === 409) {
      window.alert('К модели привязаны фотографии.');
      return;
    }
    throw new Error();
  } catch {
    window.alert('Не удалось удалить модель.');
  } finally {
    button.disabled = false;
  }
});
