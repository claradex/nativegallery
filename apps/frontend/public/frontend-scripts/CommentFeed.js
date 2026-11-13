document.addEventListener('click', async event => {
  const button = event.target.closest?.('.wvote a[vote]');
  if (!button) return;
  event.preventDefault();
  const widget = button.closest('.wvote');
  if (widget.dataset.pending) return;
  widget.dataset.pending = 'true';
  try {
    const query = new URLSearchParams({ wid: widget.getAttribute('wid'), vote: button.getAttribute('vote') });
    const response = await fetch('/api/photo/comment/rate?' + query, { cache: 'no-store' });
    if (response.status === 403) {
      window.location.assign('/login');
      return;
    }
    if (!response.ok) return;
    const [selected, counts, score] = await response.json();
    const rating = widget.querySelector('.w-rating');
    rating.textContent = score > 0 ? '+' + score : String(score);
    rating.classList.toggle('pro', score > 0);
    rating.classList.toggle('con', score < 0);
    widget.querySelector('.w-rating-ext .pro').textContent = '+' + counts[1];
    widget.querySelector('.w-rating-ext .con').textContent = String(counts[0]);
    for (const link of widget.querySelectorAll('a[vote]')) {
      link.classList.toggle('active', Boolean(selected[link.getAttribute('vote')]));
    }
  } catch {
    // Keep the current totals when the request fails.
  } finally {
    delete widget.dataset.pending;
  }
});
