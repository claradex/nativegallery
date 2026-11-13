/** @param {AbortSignal} signal */
export function bindUpload(signal) {
  const form = document.getElementById('mform');
  if (!form) return;
  const get = id => document.getElementById(id);
  const file = get('image');
  const submit = get('submitbtn');
  const errors = get('errorsbox');
  const status = get('statusbox');

  function setDate(year, month, day) {
    const select = get('year');
    if (year && !Array.from(select.options).some(option => Number(option.value) === year)) {
      select.add(new Option(year, year), 1);
    }
    select.value = year;
    get('month').value = month;
    get('day').value = day;
  }

  let dateRevision = 0;
  const dateLoaded = get('dateLoaded');
  const dateAbsent = get('dateAbsent');
  for (const id of ['year', 'month', 'day']) {
    get(id).addEventListener('change', () => {
      dateRevision++;
      dateLoaded.style.display = dateAbsent.style.display = 'none';
    }, { signal });
  }
  file.addEventListener('change', async () => {
    const selected = file.files[0];
    const revision = ++dateRevision;
    get('filename').textContent = selected?.name ?? '';
    dateLoaded.style.display = dateAbsent.style.display = 'none';
    if (!selected) return;
    let date;
    try {
      const bytes = await selected.slice(0, 512 * 1024).arrayBuffer();
      const { default: EXIF } = await import('exif-js');
      const tags = EXIF.readFromBinaryFile(bytes);
      date = /^(\d{4}):(\d{2}):(\d{2})/.exec(tags?.DateTimeOriginal ?? '');
    } catch {
      // A missing or malformed EXIF segment does not prevent manual date entry.
    }
    if (signal.aborted || revision !== dateRevision) return;
    const [, year, month, day] = date?.map(Number) ?? [];
    if (year >= 1850 && year <= 2037 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      setDate(year, month, day);
      dateLoaded.style.display = 'inline';
    } else {
      dateAbsent.style.display = 'inline';
    }
  }, { signal });
  form.querySelectorAll('[data-date]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    dateRevision++;
    dateLoaded.style.display = dateAbsent.style.display = 'none';
    const date = new Date();
    if (link.dataset.date === 'yesterday') date.setDate(date.getDate() - 1);
    if (link.dataset.date === 'unknown') setDate(0, 0, 0);
    else setDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }, { signal }));

  const results = get('vlist');
  const type = get('search_type');
  let search;
  let upload;
  signal.addEventListener('abort', () => {
    search?.abort();
    upload?.abort();
  }, { once: true });
  type.addEventListener('change', () => {
    search?.abort();
    get('nid').value = '';
    results.replaceChildren();
  }, { signal });
  get('searchVehiclesByNumBtn').addEventListener('click', async () => {
    search?.abort();
    const request = new AbortController();
    search = request;
    const params = new URLSearchParams({ type: type.value, q: get('search_num').value.trim() });
    try {
      const response = await fetch('/api/upload/entities?' + params, { signal: request.signal });
      if (!response.ok) throw new Error();
      const matches = await response.json();
      if (signal.aborted || request.signal.aborted) return;
      results.replaceChildren();
      if (!matches.length) results.textContent = 'Ничего не найдено';
      for (const entry of matches) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = entry.id + ' — ' + entry.title;
        button.addEventListener('click', () => {
          get('nid').value = entry.id;
          get('search_num').value = entry.id;
          results.textContent = entry.title;
        }, { signal });
        results.append(button);
      }
    } catch (error) {
      if (error.name !== 'AbortError') results.textContent = 'Не удалось выполнить поиск';
    }
  }, { signal });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submit.disabled) return;
    errors.style.display = 'none';
    const showError = message => {
      errors.textContent = message;
      errors.style.display = 'block';
      status.textContent = '';
      submit.disabled = false;
      get('prgb').replaceChildren();
    };
    if (!file.files.length) {
      showError('Выберите файл для загрузки.');
      return;
    }
    const bar = document.createElement('div');
    bar.id = 'myBar';
    bar.className = 'w3-container w3-green w3-center';
    Object.assign(bar.style, { width: '0%', textAlign: 'center', color: '#fff', background: '#000' });
    bar.textContent = '0%';
    get('prgb').replaceChildren(bar);
    status.textContent = submit.dataset.loading;
    submit.disabled = true;
    const request = new XMLHttpRequest();
    upload = request;
    request.open('POST', form.action);
    request.responseType = 'json';
    request.upload.addEventListener('progress', ({ loaded, total, lengthComputable }) => {
      if (!lengthComputable) return;
      const progress = Math.floor(100 * loaded / total);
      bar.style.width = bar.textContent = progress + '%';
      if (progress === 100) status.textContent = submit.dataset.finished;
    }, { signal });
    request.addEventListener('load', () => {
      const result = request.response;
      if (request.status === 200 && result?.error === 0 && Number.isInteger(result.id)) {
        window.location.replace('/photo/' + result.id);
        return;
      }
      const messages = {
        FILE_NOTSUPPORTED: 'Этот формат файла не поддерживается.',
        FILE_NOTSELECTED: 'Выберите файл для загрузки.',
        INVALID_FIELDS: 'Проверьте данные формы.',
      };
      showError(messages[result?.errorcode] ?? 'Не удалось загрузить файл.');
    }, { signal });
    request.addEventListener('error', () => showError('Не удалось загрузить файл.'), { signal });
    request.send(new FormData(form));
  }, { signal });
}
