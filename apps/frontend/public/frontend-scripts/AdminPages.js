const editor = document.getElementById('page-editor');

if (editor) {
  const body = document.getElementById('bodypost');
  const preview = document.getElementById('page-preview');
  const previewButton = document.getElementById('preview-page');
  const error = document.getElementById('page-preview-error');

  for (const button of editor.querySelectorAll('[data-format]')) {
    button.addEventListener('click', () => {
      const { selectionStart, selectionEnd } = body;
      const tag = button.dataset.format;
      const text = body.value.slice(selectionStart, selectionEnd);
      const opening = tag === 'a' ? '<a href="">' : '<' + tag + '>';
      body.setRangeText(opening + text + '</' + tag + '>', selectionStart, selectionEnd);
      body.focus();
      const start = selectionStart + (tag === 'a' ? '<a href="'.length : opening.length);
      body.setSelectionRange(start, tag === 'a' ? start : start + text.length);
    });
  }

  const attachment = document.getElementById('page-attachment');
  const address = document.getElementById('attachment-url');
  let attachmentTag;
  for (const button of editor.querySelectorAll('[data-attachment]')) {
    button.addEventListener('click', () => {
      attachmentTag = button.dataset.attachment;
      address.value = '';
      address.setCustomValidity('');
      document.getElementById('attachment-title').textContent = button.dataset.title;
      attachment.showModal();
    });
  }
  address.addEventListener('input', () => address.setCustomValidity(''));
  document.getElementById('cancel-attachment').addEventListener('click', () => attachment.close());
  document.getElementById('page-attachment-form').addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(address.value);
    if (!url || !['https:', 'http:'].includes(url.protocol)) {
      address.setCustomValidity('Укажите адрес HTTP или HTTPS.');
      address.reportValidity();
      return;
    }
    const element = document.createElement(attachmentTag);
    element.setAttribute('src', url.href);
    if (attachmentTag === 'img') element.setAttribute('alt', '');
    else {
      element.setAttribute('controls', '');
      element.setAttribute('preload', 'metadata');
    }
    body.setRangeText(element.outerHTML, body.selectionStart, body.selectionEnd, 'end');
    attachment.close();
    body.focus();
  });

  document.getElementById('close-preview').addEventListener('click', () => preview.close());
  previewButton.addEventListener('click', async () => {
    if (!editor.reportValidity()) return;
    previewButton.disabled = true;
    error.hidden = true;
    try {
      const response = await fetch('/api/admin/pages/preview', {
        method: 'POST',
        body: new URLSearchParams(new FormData(editor)),
      });
      if (!response.ok) throw new Error();
      const page = await response.json();
      document.getElementById('preview-title').textContent = page.title;
      document.getElementById('preview-content').innerHTML = page.html;
      preview.showModal();
    } catch {
      error.textContent = 'Не удалось открыть предпросмотр.';
      error.hidden = false;
    } finally {
      previewButton.disabled = false;
    }
  });
}
