/** @param {AbortSignal} signal */
export function bindUploadMap(signal) {
  const get = id => document.getElementById(id);
  const noMap = get('nomap');
  const mapRow = document.querySelector('#mform .upl-map');
  if (!noMap || !mapRow) return;
  noMap.addEventListener('change', () => {
    mapRow.hidden = noMap.checked;
    if (!noMap.checked) map?.invalidateSize();
  }, { signal });
  const leaflet = window.L;
  let map;
  if (leaflet && document.getElementById('map_canvas')) {
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
    get('mapSelector').addEventListener('change', setBase, { signal });
    const railway = leaflet.tileLayer('https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', { attribution: '© OpenRailwayMap' });
    get('railwayCheckbox').addEventListener('change', event => {
      if (event.target.checked) railway.addTo(map);
      else railway.remove();
    }, { signal });
    let marker;
    map.on('click', ({ latlng }) => {
      if (marker) marker.setLatLng(latlng);
      else marker = leaflet.marker(latlng).addTo(map);
      get('markerLat').value = latlng.lat;
      get('markerLng').value = latlng.lng;
    });
  }

  signal.addEventListener('abort', () => map?.remove(), { once: true });
}
