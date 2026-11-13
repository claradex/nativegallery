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

const updates = document.getElementById('upd_anchor');
const end = document.getElementById('scroll_anchor');
if (updates && end) {
  const ids = Array.from(document.querySelectorAll('[data-comment-id]'), row => Number(row.dataset.commentId));
  let newest = ids[0] ?? 0;
  let oldest = ids.at(-1);
  let loadingOlder = false;
  let loadingNewer = false;

  async function readComments(direction, cursor) {
    const query = new URLSearchParams({ ajax: '1', [direction]: cursor });
    const response = await fetch('/comments.php?' + query, { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load comments');
    const fragment = document.createElement('template');
    fragment.innerHTML = await response.text();
    const rows = Array.from(fragment.content.children);
    return { fragment, rows };
  }

  const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting || loadingOlder || oldest === undefined) return;
    loadingOlder = true;
    try {
      const { fragment, rows } = await readComments('before', oldest);
      if (rows.length) {
        oldest = Number(rows.at(-1).dataset.commentId);
        end.before(fragment.content);
      }
      if (rows.length < 30) observer.disconnect();
    } catch {
      // Keep the observer active so a later scroll can retry.
    } finally {
      loadingOlder = false;
    }
  });
  if (ids.length === 30) observer.observe(end);

  setInterval(async () => {
    if (loadingNewer || document.hidden) return;
    loadingNewer = true;
    try {
      const { fragment, rows } = await readComments('after', newest);
      if (!rows.length) return;
      newest = Number(rows[0].dataset.commentId);
      if (oldest === undefined) {
        oldest = Number(rows.at(-1).dataset.commentId);
        if (rows.length === 30) observer.observe(end);
      }
      updates.after(fragment.content);
    } catch {
      // The next interval can retry with the same cursor.
    } finally {
      loadingNewer = false;
    }
  }, 30_000);
}
