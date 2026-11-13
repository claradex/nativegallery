document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mform');
  const get = id => document.getElementById(id);
  const file = get('image');
  const submit = get('submitbtn');
  const errors = get('errorsbox');
  const status = get('statusbox');

  file.addEventListener('change', () => {
    get('filename').textContent = file.files[0]?.name ?? '';
  });
  form.querySelectorAll('[data-date]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const date = new Date();
    if (link.dataset.date === 'yesterday') date.setDate(date.getDate() - 1);
    const known = link.dataset.date !== 'unknown';
    const year = get('year');
    if (known && !Array.from(year.options).some(option => Number(option.value) === date.getFullYear())) {
      year.add(new Option(date.getFullYear(), date.getFullYear()), 1);
    }
    get('day').value = known ? date.getDate() : 0;
    get('month').value = known ? date.getMonth() + 1 : 0;
    year.value = known ? date.getFullYear() : 0;
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
