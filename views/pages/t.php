<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet 3D Map Example</title>
    <!-- Подключение Leaflet CSS и JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

    <!-- Подключение плагина Leaflet-Geoman -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet-geoman-free/dist/leaflet-geoman.css">
    <script src="https://unpkg.com/leaflet-geoman-free/dist/leaflet-geoman.min.js"></script>

    <!-- Подключение плагина Leaflet-3d-model -->
    <script src="https://unpkg.com/leaflet-3d-model/dist/leaflet-3d-model.min.js"></script>

    <style>
        #map {
            height: 500px;
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <script>
        var map = L.map('map').setView([51.505, -0.09], 13);

        // Добавление основного слоя карты
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Инициализация плагина Leaflet-Geoman
        map.pm.addControls({
            position: 'topleft',
            drawCircle: false,
            drawCircleMarker: false,
            drawRectangle: false,
            drawCircleMarker: false,
            drawPolygon: false,
            drawPolyline: false,
            drawMarker: false,
        });

        // Добавление 3D модели на карту
        var model = new L.Model3D({
            position: [51.505, -0.09],
            rotation: [0, 0, 0],
            scale: 0.1,
            path: 'path/to/your/3d-model.obj',
            format: 'obj'
        });

        map.addLayer(model);
    </script>
</body>
</html>