/** @param {AbortSignal} signal */
export function bind(signal) {
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.photoDecision) return;
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    const fields = new FormData(form);
    const query = new URLSearchParams({ id: form.dataset.photoDecision, mod: form.dataset.status });
    for (const name of ['reason', 'irate', 'krate']) {
      const value = fields.get(name);
      if (typeof value === 'string') query.set(name, value);
    }
    try {
      const response = await fetch('/api/admin/images/setvisibility?' + query, {
        method: 'POST',
        body: new URLSearchParams({ comment: fields.get('comment') ?? '' }),
      });
      if (!response.ok) throw new Error();
      location.reload();
    } catch {
      button.disabled = false;
      window.alert('Не удалось сохранить решение.');
    }
  }, { signal });
}
