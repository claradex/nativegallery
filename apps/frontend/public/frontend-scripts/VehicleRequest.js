(() => {
  const form = document.getElementById('mform');
  if (!form) return;
  form.addEventListener('change', event => {
    if (event.target.name !== 'base_nid') return;
    const values = JSON.parse(event.target.dataset.values ?? '[]');
    form.querySelectorAll('[name^="modelinput_"]').forEach((input, index) => {
      input.value = values[index] ?? '';
    });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    try {
      const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
      if (!response.ok) throw new Error();
      const notice = document.createElement('div');
      notice.style.cssText = 'border:solid 1px rgb(0,140,86);padding:6px 10px 7px;margin-bottom:13px;background-color:rgb(137,216,150)';
      notice.textContent = 'Заявка на рассмотрение успешно отправлена';
      form.replaceWith(notice);
    } catch {
      window.alert('Не удалось отправить заявку.');
      window.turnstile?.reset();
      button.disabled = false;
    }
  });
})();
