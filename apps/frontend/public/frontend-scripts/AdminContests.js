const contestEditor = document.querySelector('#createContest form');
const immediate = contestEditor?.elements.namedItem('startContestNow');
const opening = contestEditor?.elements.namedItem('opendate');
function syncOpening() { opening.disabled = immediate.checked; }
immediate?.addEventListener('change', syncOpening);
if (immediate) syncOpening();

document.addEventListener('submit', async event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-contest-editor')) return;
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  if (button.disabled) return;
  button.disabled = true;
  try {
    const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
    if (!response.ok || (await response.json()).error !== 0) throw new Error();
    location.reload();
  } catch {
    button.disabled = false;
    window.alert('Не удалось сохранить данные конкурса. Проверьте поля формы.');
  }
});
