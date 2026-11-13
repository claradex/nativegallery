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

const commentsPanel = document.getElementById('pp-item-comments');
const commentForm = commentsPanel?.querySelector('#f1');

commentForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const editor = commentForm.querySelector('#wtext');
  const submit = commentForm.querySelector('#sbmt');
  const status = commentForm.querySelector('#statusSend');
  if (submit.disabled) return;
  const body = new FormData(commentForm);
  const content = editor.cloneNode(true);
  for (const emoji of content.querySelectorAll('img[data-code]')) emoji.replaceWith(emoji.dataset.code);
  content.hidden = true;
  // Preserve line breaks from the editable HTML using the live editor layout.
  content.style.position = 'absolute';
  content.style.visibility = 'hidden';
  content.hidden = false;
  content.removeAttribute('id');
  editor.after(content);
  body.set('wtext', content.innerText.trim());
  content.remove();
  status.hidden = true;
  submit.disabled = true;
  try {
    const response = await fetch(commentForm.action, { method: 'POST', body });
    const result = response.ok ? await response.json() : null;
    if (result?.error !== 0) throw new Error();
    location.reload();
  } catch {
    status.textContent = 'Не удалось добавить комментарий.';
    status.hidden = false;
    submit.disabled = false;
  }
});

commentsPanel?.addEventListener('click', async event => {
  const control = event.target.closest?.('[data-comment-action]');
  if (!control || control.dataset.commentAction === 'expand') return;
  event.preventDefault();
  const comment = control.closest('[data-comment-id]');
  const id = comment?.dataset.commentId;
  if (!id || comment.dataset.pending) return;
  const action = control.dataset.commentAction;
  const root = '/api/photo/comment/';
  let url = root + id + '/' + action;
  let options = { method: 'POST' };
  if (action === 'vote') {
    url = root + 'rate?' + new URLSearchParams({ wid: id, vote: control.dataset.vote });
    options = { cache: 'no-store' };
  } else if (action === 'edit') {
    const value = window.prompt('Редактировать комментарий', control.dataset.commentBody);
    if (value === null) return;
    options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) };
  } else if (action === 'delete') {
    if (!window.confirm('Удалить комментарий?')) return;
  } else if (action !== 'pin') {
    return;
  }

  comment.dataset.pending = 'true';
  try {
    const response = await fetch(url, options);
    const result = response.ok ? await response.json() : null;
    if (action === 'vote' ? !Array.isArray(result) : result?.error !== 0) throw new Error();
    location.reload();
  } catch {
    window.alert('Не удалось выполнить действие.');
    delete comment.dataset.pending;
  }
});

const photoVote = document.querySelector('[data-photo-vote]');
let voting = false;
photoVote?.addEventListener('click', async event => {
  const button = event.target.closest?.('[data-vote]');
  if (!button) return;
  event.preventDefault();
  if (voting) return;
  voting = true;
  try {
    const query = new URLSearchParams({ pid: photoVote.dataset.photoVote, vote: button.dataset.vote });
    const response = await fetch('/api/photo/vote?' + query, { cache: 'no-store' });
    if (!response.ok || !(await response.json())?.buttons) throw new Error();
    location.reload();
  } catch {
    voting = false;
    window.alert('Не удалось сохранить оценку.');
  }
});
