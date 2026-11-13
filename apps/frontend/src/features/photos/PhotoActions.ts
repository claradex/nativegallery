export function bindPhotoActions(signal: AbortSignal) {
  const favorite = document.querySelector<HTMLAnchorElement>('#favLink');
  let updatingFavorite = false;
  favorite?.addEventListener('click', async event => {
    event.preventDefault();
    if (updatingFavorite) return;
    updatingFavorite = true;
    try {
      const response = await fetch('/api/photo/' + (favorite.dataset.photoId ?? '') + '/favorite', { cache: 'no-store' });
      if (!response.ok) return;
      const state = await response.text();
      if (state === '0' || state === '1') {
        favorite.textContent = state === '1' ? 'Удалить фото из Избранного' : 'Добавить фото в Избранное';
      }
    } catch {
      window.alert('Не удалось изменить избранное.');
    } finally {
      updatingFavorite = false;
    }
  }, { signal });

  document.getElementById('pp-item-comments')?.addEventListener('click', event => {
    const button = event.target instanceof Element && event.target.closest<HTMLElement>('[data-comment-action="expand"]');
    if (!button) return;
    event.preventDefault();
    const text = button.previousElementSibling;
    if (!(text instanceof HTMLElement)) return;
    text.hidden = !text.hidden;
    text.style.display = text.hidden ? '' : 'inline';
    button.textContent = text.hidden ? 'показать больше' : 'показать меньше';
  }, { signal });

  const commentsPanel = document.getElementById('pp-item-comments');
  const commentForm = commentsPanel?.querySelector<HTMLFormElement>('#f1');

  const commentFile = commentForm?.querySelector<HTMLInputElement>('#comment-file');
  commentForm?.querySelector('#attachFile')?.addEventListener('click', () => commentFile?.click());
  commentFile?.addEventListener('change', () => {
    const list = commentForm?.querySelector('#fileList');
    if (list) list.textContent = commentFile.files?.[0]?.name ?? '';
  }, { signal });

  commentForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const editor = commentForm.querySelector<HTMLElement>('#wtext');
    const submit = commentForm.querySelector<HTMLButtonElement>('#sbmt');
    const status = commentForm.querySelector<HTMLElement>('#statusSend');
    if (!editor || !status || !submit || submit.disabled) return;
    const body = new FormData(commentForm);
    const content = editor.cloneNode(true) as HTMLElement;
    for (const emoji of content.querySelectorAll<HTMLImageElement>('img[data-code]')) emoji.replaceWith(emoji.dataset.code ?? '');
      // Preserve line breaks from the editable HTML using the live editor layout.
    content.style.position = 'absolute';
    content.style.visibility = 'hidden';
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
  }, { signal });

  commentsPanel?.addEventListener('click', async event => {
    const control = event.target instanceof Element && event.target.closest<HTMLElement>('[data-comment-action]');
    if (!control || control.dataset.commentAction === 'expand') return;
    event.preventDefault();
    const comment = control.closest<HTMLElement>('[data-comment-id]');
    const id = comment?.dataset.commentId;
    if (!comment || !id || comment.dataset.pending) return;
    const action = control.dataset.commentAction;
    const root = '/api/photo/comment/';
    let url = root + id + '/' + action;
    let options: RequestInit = { method: 'POST' };
    if (action === 'vote') {
      url = root + 'rate?' + new URLSearchParams({ wid: id, vote: control.dataset.vote ?? '' });
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
  }, { signal });

  const photoVote = document.querySelector<HTMLElement>('[data-photo-vote]');
  let voting = false;
  photoVote?.addEventListener('click', async event => {
    const button = event.target instanceof Element && event.target.closest<HTMLElement>('[data-vote]');
    if (!button) return;
    event.preventDefault();
    if (voting) return;
    voting = true;
    try {
      const query = new URLSearchParams({ pid: photoVote.dataset.photoVote ?? '', vote: button.dataset.vote ?? '' });
      const response = await fetch('/api/photo/vote?' + query, { cache: 'no-store' });
      if (!response.ok || !(await response.json())?.buttons) throw new Error();
      location.reload();
    } catch {
      voting = false;
      window.alert('Не удалось сохранить оценку.');
    }
  }, { signal });
}
