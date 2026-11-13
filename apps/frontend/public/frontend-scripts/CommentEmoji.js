(() => {
  const toggle = document.getElementById('showPicker');
  if (!toggle) return;
  const picker = document.getElementById('picker');
  const editor = document.getElementById('wtext');
  let catalog;
  let caret;
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.contains(selection.anchorNode) && editor.contains(selection.focusNode)) {
      caret = selection.getRangeAt(0).cloneRange();
    }
  });
  function close() {
    picker.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function insert(url, code) {
    const selection = window.getSelection();
    editor.focus();
    const range = caret && editor.contains(caret.commonAncestorContainer) ? caret : document.createRange();
    if (range !== caret) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    const image = document.createElement('img');
    image.src = url;
    image.className = 'editor-emoji';
    image.dataset.code = image.alt = code;
    range.deleteContents();
    range.insertNode(image);
    range.setStartAfter(image);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    close();
  }
  async function load() {
    const response = await fetch('/api/emoji/load');
    if (!response.ok) throw new Error('Emoji catalog unavailable');
    const { data } = await response.json();
    const options = document.createDocumentFragment();
    for (const entry of data) {
      const match = /^\/static\/img\/smileys\/(1\/[\w-]+)\.gif$/.exec(entry.url);
      if (!match) continue;
      const code = '[' + match[1] + ']';
      const button = document.createElement('button');
      button.type = 'button';
      button.style.cssText = 'border:0;padding:0;background:none';
      button.setAttribute('aria-label', code);
      const image = document.createElement('img');
      image.src = entry.url;
      image.className = 'emoji-option';
      image.alt = image.title = code;
      image.loading = 'lazy';
      button.append(image);
      button.addEventListener('click', () => insert(entry.url, code));
      options.append(button);
    }
    picker.replaceChildren(options);
  }
  toggle.addEventListener('click', async () => {
    if (picker.classList.contains('active')) return close();
    picker.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    try {
      catalog ??= load();
      await catalog;
    } catch {
      catalog = undefined;
      picker.textContent = 'Не удалось загрузить эмодзи.';
    }
  });
  document.addEventListener('click', event => {
    if (!picker.contains(event.target) && !toggle.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.classList.contains('active')) {
      close();
      toggle.focus();
    }
  });
})();
