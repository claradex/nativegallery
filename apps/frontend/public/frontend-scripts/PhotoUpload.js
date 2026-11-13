document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mform');
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
    });
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
      const tags = window.EXIF?.readFromBinaryFile(bytes);
      date = /^(\d{4}):(\d{2}):(\d{2})/.exec(tags?.DateTimeOriginal ?? '');
    } catch {
      // A missing or malformed EXIF segment does not prevent manual date entry.
    }
    if (revision !== dateRevision) return;
    const [, year, month, day] = date?.map(Number) ?? [];
    if (year >= 1850 && year <= 2037 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      setDate(year, month, day);
      dateLoaded.style.display = 'inline';
    } else {
      dateAbsent.style.display = 'inline';
    }
  });
  form.querySelectorAll('[data-date]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    dateRevision++;
    dateLoaded.style.display = dateAbsent.style.display = 'none';
    const date = new Date();
    if (link.dataset.date === 'yesterday') date.setDate(date.getDate() - 1);
    if (link.dataset.date === 'unknown') setDate(0, 0, 0);
    else setDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }));

  const results = get('vlist');
  const type = get('search_type');
  let search;
  type.addEventListener('change', () => {
    search?.abort();
    get('nid').value = '';
    results.replaceChildren();
  });
  get('searchVehiclesByNumBtn').addEventListener('click', async () => {
    search?.abort();
    search = new AbortController();
    const params = new URLSearchParams({ type: type.value, q: get('search_num').value.trim() });
    try {
      const response = await fetch('/api/upload/entities?' + params, { signal: search.signal });
      if (!response.ok) throw new Error();
      const matches = await response.json();
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
        });
        results.append(button);
      }
    } catch (error) {
      if (error.name !== 'AbortError') results.textContent = 'Не удалось выполнить поиск';
    }
  });

  const noMap = get('nomap');
  const mapRow = form.querySelector('.upl-map');
  noMap.addEventListener('change', () => {
    mapRow.hidden = noMap.checked;
    if (!noMap.checked) map?.invalidateSize();
  });
  const leaflet = window.L;
  let map;
  if (leaflet) {
    map = leaflet.map('map_canvas').setView([55.75, 37.62], 4);
    const tiles = {
      osm: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png', '© OpenStreetMap contributors'],
      hot: ['https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', '© OpenStreetMap contributors, HOT'],
      opnv: ['https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', '© OpenStreetMap contributors, ÖPNVkarte'],
    };
    let base;
    const setBase = () => {
      const [url, attribution] = tiles[get('mapSelector').value] ?? tiles.osm;
      base?.remove();
      base = leaflet.tileLayer(url, { attribution }).addTo(map);
    };
    setBase();
    get('mapSelector').addEventListener('change', setBase);
    const railway = leaflet.tileLayer('https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', { attribution: '© OpenRailwayMap' });
    get('railwayCheckbox').addEventListener('change', event => {
      if (event.target.checked) railway.addTo(map);
      else railway.remove();
    });
    let marker;
    map.on('click', ({ latlng }) => {
      if (marker) marker.setLatLng(latlng);
      else marker = leaflet.marker(latlng).addTo(map);
      get('markerLat').value = latlng.lat;
      get('markerLng').value = latlng.lng;
    });
  }

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
    request.open('POST', form.action);
    request.responseType = 'json';
    request.upload.addEventListener('progress', ({ loaded, total, lengthComputable }) => {
      if (!lengthComputable) return;
      const progress = Math.floor(100 * loaded / total);
      bar.style.width = bar.textContent = progress + '%';
      if (progress === 100) status.textContent = submit.dataset.finished;
    });
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
    });
    request.addEventListener('error', () => showError('Не удалось загрузить файл.'));
    request.send(new FormData(form));
  });
});
