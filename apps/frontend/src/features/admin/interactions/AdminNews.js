/** @param {AbortSignal} signal */
export function bind(signal) {
  async function changeNews(url, body) {
    const response = await fetch(url, { method: 'POST', body });
    if (!response.ok || (await response.json()).error !== 0) throw new Error();
    location.reload();
  }

  document.getElementById('create-news')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    try {
      await changeNews(form.action, new URLSearchParams(new FormData(form)));
    } catch {
      submit.disabled = false;
      window.alert('Не удалось создать новость.');
    }
  }, { signal });

  document.getElementById('news')?.addEventListener('click', async event => {
    const link = event.target.closest?.('[data-news-delete]');
    if (!link) return;
    event.preventDefault();
    if (link.dataset.pending) return;
    link.dataset.pending = 'true';
    try {
      await changeNews('/api/admin/news/' + link.dataset.newsDelete + '/delete');
    } catch {
      delete link.dataset.pending;
      window.alert('Не удалось удалить новость.');
    }
  }, { signal });
}
