const favorite = document.getElementById('favLink');
let updatingFavorite = false;
favorite?.addEventListener('click', async event => {
  event.preventDefault();
  if (updatingFavorite) return;
  updatingFavorite = true;
  try {
    const response = await fetch('/api/photo/' + favorite.dataset.photoId + '/favorite', { cache: 'no-store' });
    if (!response.ok) return;
    const state = await response.text();
    if (state === '0' || state === '1') {
      favorite.textContent = state === '1' ? 'Удалить фото из Избранного' : 'Добавить фото в Избранное';
    }
  } finally {
    updatingFavorite = false;
  }
});

document.getElementById('pp-item-comments')?.addEventListener('click', event => {
  const button = event.target.closest?.('[data-comment-action="expand"]');
  if (!button) return;
  event.preventDefault();
  const text = button.previousElementSibling;
  if (!text) return;
  text.hidden = !text.hidden;
  text.style.display = text.hidden ? '' : 'inline';
  button.textContent = text.hidden ? 'показать больше' : 'показать меньше';
});
