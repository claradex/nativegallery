/** @param {AbortSignal} signal */
export function bind(signal) {
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
      }, { signal });
    }

    const attachment = document.getElementById('page-attachment');
    const address = document.getElementById('attachment-url');
    const file = document.getElementById('attachment-file');
    const attachmentError = document.getElementById('attachment-error');
    const attachButton = document.getElementById('submit-attachment');
    const cancelAttachment = document.getElementById('cancel-attachment');
    let attachmentTag;
    attachment.addEventListener('cancel', event => {
      if (attachButton.disabled) event.preventDefault();
    }, { signal });
    for (const button of editor.querySelectorAll('[data-attachment]')) {
      button.addEventListener('click', () => {
        attachmentTag = button.dataset.attachment;
        address.value = '';
        file.value = '';
        file.accept = { img: '.jpg,.jpeg,.png,.gif,.webp', video: '.mp4', audio: '.mp3' }[attachmentTag];
        attachmentError.hidden = true;
        address.setCustomValidity('');
        document.getElementById('attachment-title').textContent = button.dataset.title;
        attachment.showModal();
      }, { signal });
    }
    file.addEventListener('change', () => address.setCustomValidity(''), { signal });
    address.addEventListener('input', () => address.setCustomValidity(''), { signal });
    cancelAttachment.addEventListener('click', () => attachment.close(), { signal });
    document.getElementById('page-attachment-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (attachButton.disabled) return;
      attachmentError.hidden = true;
      let source;
      if (file.files.length) {
        const data = new FormData();
        data.append('kind', attachmentTag);
        data.append('file', file.files[0]);
        attachButton.disabled = cancelAttachment.disabled = true;
        try {
          const response = await fetch('/api/admin/pages/attachments', { method: 'POST', body: data });
          if (!response.ok) throw new Error();
          source = (await response.json()).url;
        } catch {
          attachmentError.textContent = 'Не удалось загрузить файл. Проверьте формат и размер.';
          attachmentError.hidden = false;
          return;
        } finally {
          attachButton.disabled = cancelAttachment.disabled = false;
        }
      } else {
        try {
          const url = new URL(address.value);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
          source = url.href;
        } catch {
          address.setCustomValidity('Выберите файл или укажите адрес HTTP или HTTPS.');
          address.reportValidity();
          return;
        }
      }
      const element = document.createElement(attachmentTag);
      element.setAttribute('src', source);
      if (attachmentTag === 'img') element.setAttribute('alt', '');
      else {
        element.setAttribute('controls', '');
        element.setAttribute('preload', 'metadata');
      }
      body.setRangeText(element.outerHTML, body.selectionStart, body.selectionEnd, 'end');
      attachment.close();
      body.focus();
    }, { signal });

    document.getElementById('close-preview').addEventListener('click', () => preview.close(), { signal });
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
    }, { signal });
  }
}
