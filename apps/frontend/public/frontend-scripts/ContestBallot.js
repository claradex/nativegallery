(() => {
  const ballot = document.querySelector('[data-contest]');
  if (!ballot) return;
  const message = ballot.querySelector('#tip');
  let busy = false;
  ballot.addEventListener('click', async event => {
    const link = event.target.closest?.('[data-contest-photo]');
    if (!link) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    const pid = link.dataset.contestPhoto;
    const query = new URLSearchParams({ action: 'vote-contest', pid, kid: ballot.dataset.contest });
    try {
      const response = await fetch('/api/photo/contests/rate?' + query, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const [selection, text] = await response.json();
      link.classList.toggle('voted', selection[pid] === 1);
      message.textContent = text;
    } catch {
      message.textContent = 'Не удалось сохранить голос.';
    } finally {
      busy = false;
    }
  });
})();
