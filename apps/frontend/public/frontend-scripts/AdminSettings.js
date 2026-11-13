document.getElementById('tasks__block')?.addEventListener('click', async event => {
  const button = event.target.closest?.('[data-task-action]');
  const row = button?.closest('[data-task]');
  if (!row || row.dataset.pending) return;
  const error = document.getElementById('task-error');
  const type = button.dataset.taskAction;
  const query = new URLSearchParams({ id: row.dataset.task, type });
  row.dataset.pending = 'true';
  const controls = row.querySelectorAll('button');
  for (const control of controls) control.disabled = true;
  error.hidden = true;
  try {
    const response = await fetch('/api/admin/settings/taskmanager?' + query, { method: 'POST' });
    if (!response.ok || (await response.json()).error !== 0) throw new Error();
    row.querySelector('[data-task-status]').textContent = type === '1' ? 'Запущена' : 'Остановлена';
  } catch {
    error.textContent = 'Не удалось изменить состояние задачи.';
    error.hidden = false;
  } finally {
    delete row.dataset.pending;
    for (const control of controls) control.disabled = false;
  }
});
