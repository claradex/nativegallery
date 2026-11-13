(() => {
  const widget = document.querySelector('[data-author-subscription]');
  if (!widget) return;
  const toggle = widget.querySelector('.toggle');
  const count = widget.querySelector('#subscr_cnt');
  let pending = false;

  async function change() {
    if (pending) return;
    pending = true;
    try {
      const query = new URLSearchParams({ action: 'subscribe', subj: 'a', id: widget.dataset.authorSubscription });
      const response = await fetch('/api/subscribe?' + query, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const value = await response.text();
      if (value !== '0' && value !== '1') throw new Error();
      const subscribed = value === '1';
      const before = toggle.classList.contains('on');
      toggle.classList.toggle('on', subscribed);
      toggle.setAttribute('aria-checked', String(subscribed));
      if (before !== subscribed) count.textContent = String(Math.max(0, Number(count.textContent) + (subscribed ? 1 : -1)));
    } catch {
      window.alert('Не удалось изменить подписку.');
    } finally {
      pending = false;
    }
  }

  widget.addEventListener('click', event => {
    if (event.target.closest?.('.toggle, .toggle-label')) void change();
  });
  toggle.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    void change();
  });
})();
