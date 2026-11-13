/** @param {AbortSignal} signal */
export function bind(signal) {
  (() => {
    const form = document.getElementById('form');
    const entity = document.getElementById('entitySelect');
    const fields = document.getElementById('mainContent');
    const submit = document.getElementById('addButton');
    const status = document.getElementById('model-status');
    let fieldRequest;
    const editing = form.dataset.edit === 'true';
    let saved = {};
    try { saved = JSON.parse(form.dataset.content ?? '{}') ?? {}; } catch {}

    function showError(message) {
      status.textContent = message;
      status.hidden = false;
    }

    entity.addEventListener('change', async () => {
      fieldRequest?.abort();
      const request = new AbortController();
      fieldRequest = request;
      fields.replaceChildren();
      submit.hidden = true;
      submit.disabled = true;
      status.hidden = true;
      if (!entity.value) return;
      try {
        const response = await fetch('/api/admin/models/fields/' + encodeURIComponent(entity.value), { signal: request.signal });
        if (!response.ok) throw new Error();
        const schema = await response.json();
        if (request.signal.aborted) return;
        for (const [index, field] of schema.entries()) {
          const group = document.createElement('div');
          group.className = 'mt-3';
          const label = document.createElement('label');
          label.className = 'form-label';
          label.htmlFor = field.name;
          label.textContent = field.label;
          const input = document.createElement('input');
          input.className = 'form-control';
          input.id = input.name = field.name;
          input.placeholder = field.label;
          input.required = field.required;
          if (editing) input.value = saved[index + 1]?.value ?? '';
          group.append(label, input);
          fields.append(group);
        }
        submit.hidden = false;
        submit.disabled = false;
      } catch {
        if (!request.signal.aborted) showError('Не удалось загрузить поля модели.');
      }
    }, { signal });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const body = new URLSearchParams(new FormData(form));
      submit.disabled = true;
      entity.disabled = true;
      status.hidden = true;
      try {
        const response = await fetch(form.action, { method: editing ? 'PATCH' : 'POST', body });
        if (!response.ok) throw new Error();
        location.assign('/admin?type=Models');
      } catch {
        showError('Не удалось сохранить модель.');
        submit.disabled = false;
        entity.disabled = editing;
      }
    }, { signal });
    if (entity.value) entity.dispatchEvent(new Event('change'));
  })();
}
