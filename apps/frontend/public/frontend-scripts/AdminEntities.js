(() => {
  const form = document.getElementById('entity-create');
  if (!form) return;
  const fields = document.getElementById('entityform');
  const add = document.getElementById('add-variable');
  const template = [...fields.children].map(column => column.cloneNode(true));
  let index = 1;

  add.addEventListener('click', () => {
    index += 1;
    for (const column of template) {
      const copy = column.cloneNode(true);
      const control = copy.querySelector('input, select');
      control.id = control.name = control.name.replace(/_1$/, '_' + index);
      copy.querySelector('label').htmlFor = control.id;
      fields.append(copy);
    }
    add.disabled = index >= 99;
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const status = document.getElementById('entity-status');
    if (submit.disabled) return;
    submit.disabled = true;
    status.hidden = true;
    try {
      const response = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
      if (!response.ok) throw new Error();
      location.assign('/admin?type=Entities');
    } catch {
      status.textContent = 'Не удалось сохранить сущность. Проверьте, что ID полей не повторяются.';
      status.hidden = false;
      submit.disabled = false;
    }
  });
})();
