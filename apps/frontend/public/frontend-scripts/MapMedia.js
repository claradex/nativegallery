(() => {
  const L = window.L;
  if (!L?.markerClusterGroup) return;
  const map = L.map('mapd').setView([55.751244, 37.618423], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);
  const markers = L.markerClusterGroup().addTo(map);
  const cached = new Set();
  let timer;
  let pending;

  function image(src, className) {
    const img = document.createElement('img');
    img.className = className;
    img.alt = '';
    img.src = src;
    return img;
  }

  function marker(photo) {
    const icon = document.createElement('div');
    icon.className = 'marker-container';
    const thumb = image(photo.thumb, 'blur-image');
    thumb.addEventListener('load', () => thumb.classList.add('loaded-image'));
    const badge = document.createElement('div');
    badge.className = 'marker-badge';
    badge.textContent = '📷';
    icon.append(thumb, badge);

    return L.marker([photo.lat, photo.lng], { icon: L.divIcon({ className: 'custom-marker', html: icon }) })
      .bindPopup(() => {
        const popup = document.createElement('div');
        popup.className = 'photo-modal-content';
        const container = document.createElement('div');
        container.className = 'image-container';
        const preview = image(photo.photourl_small, 'blur-image preview-image');
        const original = image(photo.photourl, 'blur-image full-image');
        original.addEventListener('load', () => {
          original.classList.add('loaded-image');
          preview.style.opacity = '0';
        });
        container.append(preview, original);
        popup.append(container);
        return popup;
      });
  }

  async function load() {
    const controller = new AbortController();
    pending = controller;
    const bounds = map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const wrap = value => (value + 180 - Math.floor((value + 180) / 360) * 360) - 180;
    const full = east - west >= 360;
    const params = new URLSearchParams({
      north: bounds.getNorth().toFixed(6), south: bounds.getSouth().toFixed(6),
      west: full ? -180 : wrap(west).toFixed(6), east: full ? 180 : wrap(east).toFixed(6), zoom: map.getZoom(),
    });
    try {
      const response = await fetch('/api/photo/loadmap?' + params, { signal: controller.signal });
      if (!response.ok) throw new Error();
      const photos = await response.json();
      if (controller.signal.aborted) return;
      for (const photo of photos) {
        if (cached.has(photo.id)) continue;
        markers.addLayer(marker(photo));
        cached.add(photo.id);
      }
    } catch {
      if (controller.signal.aborted) return;
      const notification = document.createElement('div');
      notification.className = 'map-notification error';
      notification.textContent = 'Ошибка загрузки данных';
      document.body.append(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  }

  function schedule() {
    pending?.abort();
    clearTimeout(timer);
    timer = setTimeout(load, 300);
  }
  map.on('moveend', schedule);
  schedule();
})();
