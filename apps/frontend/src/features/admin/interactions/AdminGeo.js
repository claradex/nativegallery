/** @param {AbortSignal} signal */
export function bind(signal) {
  async function changeGeo(url, body) {
    const response = await fetch(url, { method: 'POST', body });
    if (!response.ok || (await response.json()).error !== 0) throw new Error();
  }

  document.getElementById('geo-create')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    try {
      await changeGeo(form.action, new URLSearchParams(new FormData(form)));
      location.reload();
    } catch {
      button.disabled = false;
      window.alert('Не удалось добавить запись.');
    }
  }, { signal });

  document.getElementById('geo-list')?.addEventListener('click', async event => {
    const button = event.target.closest?.('button[data-geo-delete]');
    if (!button || button.disabled || !window.confirm('Удалить запись?')) return;
    button.disabled = true;
    try {
      await changeGeo('/api/admin/geodb/delete?' + new URLSearchParams({ id: button.dataset.geoDelete }));
      button.closest('tr')?.remove();
    } catch {
      button.disabled = false;
      window.alert('Не удалось удалить запись.');
    }
  }, { signal });
}
