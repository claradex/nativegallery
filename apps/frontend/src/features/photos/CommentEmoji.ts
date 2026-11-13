export function bindCommentEmoji(signal: AbortSignal) {
  const toggle = document.getElementById('showPicker');
  const picker = document.getElementById('picker');
  const editor = document.getElementById('wtext');
  if (!toggle || !picker || !editor) return;
  const pickerElement = picker;
  const toggleElement = toggle;
  const editable = editor;
  let catalog: Promise<void> | undefined;
  let caret: Range | undefined;
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editable.contains(selection.anchorNode) && editable.contains(selection.focusNode)) {
      caret = selection.getRangeAt(0).cloneRange();
    }
  }, { signal });
  function close() {
    pickerElement.classList.remove('active');
    toggleElement.setAttribute('aria-expanded', 'false');
  }
  function insert(url: string, code: string) {
    const selection = window.getSelection();
    if (!selection) return;
    editable.focus();
    const range = caret && editable.contains(caret.commonAncestorContainer) ? caret : document.createRange();
    if (range !== caret) {
      range.selectNodeContents(editable);
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
    const response = await fetch('/api/emoji/load', { signal });
    if (!response.ok) throw new Error('Emoji catalog unavailable');
    const { data }: { data: { url: string }[] } = await response.json();
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
      button.addEventListener('click', () => insert(entry.url, code), { signal });
      options.append(button);
    }
    if (!signal.aborted) pickerElement.replaceChildren(options);
  }
  toggleElement.addEventListener('click', async () => {
    if (pickerElement.classList.contains('active')) return close();
    pickerElement.classList.add('active');
    toggleElement.setAttribute('aria-expanded', 'true');
    try {
      catalog ??= load();
      await catalog;
    } catch {
      catalog = undefined;
      if (signal.aborted) return;
      pickerElement.textContent = 'Не удалось загрузить эмодзи.';
    }
  }, { signal });
  document.addEventListener('click', event => {
    if (event.target instanceof Node && !pickerElement.contains(event.target) && !toggleElement.contains(event.target)) close();
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pickerElement.classList.contains('active')) {
      close();
      toggleElement.focus();
    }
  }, { signal });
}
