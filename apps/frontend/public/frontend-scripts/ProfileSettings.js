(() => {
  const form = document.getElementById('form');
  const theme = form?.elements.namedItem('theme_id');
  if (theme) {
    theme.addEventListener('change', () => form.requestSubmit());
    return;
  }
  if (!form) return;
  const submit = document.getElementById('submitBtn');
  const errors = document.getElementById('errors');
  const applied = document.getElementById('applied');
  const popup = document.getElementById('userphoto_big_div');
  document.getElementById('userphotoLink').addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('userphoto_big_img').src = document.getElementById('userphoto_img').src;
    popup.style.top = window.scrollY + 10 + 'px';
    popup.style.display = 'block';
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link?.id === 'userphotoLink') return;
    if (!popup.contains(event.target) || link) {
      if (link && popup.contains(link)) event.preventDefault();
      popup.style.display = 'none';
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    errors.style.display = applied.style.display = 'none';
    const label = submit.value;
    submit.disabled = true;
    submit.value = 'Отправка данных...';
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!response.ok) throw new Error('Не удалось сохранить изменения.');
      const result = await response.text();
      if (result === 'refresh') window.location.reload();
      else if (result) throw new Error(result);
      else applied.style.display = 'inline';
    } catch (error) {
      errors.textContent = error.message;
      errors.style.display = 'inline';
    } finally {
      submit.disabled = false;
      submit.value = label;
    }
  });
})();
