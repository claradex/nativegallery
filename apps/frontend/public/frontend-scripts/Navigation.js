(() => {
  const navigation = {
    ArrowLeft: 'PrevLink',
    ArrowRight: 'NextLink',
    ArrowUp: 'UpLink',
    ArrowDown: 'DownLink',
  };

  document.addEventListener('keydown', event => {
    if (!event.ctrlKey || event.defaultPrevented ||
        event.target.closest?.('input, textarea, select, [contenteditable]')) return;
    const href = event.key === 'Home' ? '/' : document.getElementById(navigation[event.key])?.getAttribute('href');
    if (!href) return;
    event.preventDefault();
    location.assign(href);
  });

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link) return;
    if (link.matches('.mm-item[href="#"]')) event.preventDefault();
    if (link.classList.contains('self-close')) {
      event.preventDefault();
      window.open(link.href);
    }
  });

  function setFieldActive(event, active) {
    const field = event.target.closest?.('.form-field');
    if (!field || (!active && field.contains(event.relatedTarget))) return;
    field.classList.toggle('active', active);
    const label = field.previousElementSibling;
    if (label?.matches('.form-label')) label.classList.toggle('active', active);
  }

  document.addEventListener('focusin', event => setFieldActive(event, true));
  document.addEventListener('focusout', event => setFieldActive(event, false));
})();
