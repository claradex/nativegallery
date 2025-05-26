<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{Vehicle, User};


?>

<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
    <style>
        #mapd {
            height: 50vh;
        }

        .custom-tooltip {
            background: white;
            border: 2px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            max-width: 200px;
        }
    </style>
    <style>
        .blur-image {
            filter: blur(5px);
            transition: filter 0.5s ease, opacity 0.3s ease;
            opacity: 0.9;
        }

        .loaded-image {
            filter: none;
            opacity: 1;
        }

        .marker-container {
            position: relative;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .marker-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .photo-popup {
            max-width: 300px;
        }

        .photo-popup img {
            max-width: 100%;
            height: auto;
            display: block;
        }

        .map-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px;
            background: #ff4444;
            color: white;
            border-radius: 5px;
            z-index: 1000;
        }
    </style>
</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <h1>Map Media</h1>
                <div id="mapd"></div>

                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
            </td>
        </tr>
        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
        <script>
            const map = L.map('mapd').setView([55.751244, 37.618423], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            let loadedPhotoIds = new Set();
            let abortController = null;
            const markers = L.markerClusterGroup();
            const cachedOriginals = new Map();

            function debounce(func, wait) {
                let timeout;
                return function(...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            }

            const loadPhotos = debounce(async () => {
                try {
                    if (abortController) abortController.abort();

                    const newController = new AbortController();
                    abortController = newController;

                    const bounds = map.getBounds();
                    const params = new URLSearchParams({
                        north: bounds.getNorth().toFixed(6),
                        south: bounds.getSouth().toFixed(6),
                        west: bounds.getWest().toFixed(6),
                        east: bounds.getEast().toFixed(6),
                        zoom: map.getZoom()
                    });

                    const response = await fetch(`/api/photo/loadmap?${params}`, {
                        signal: newController.signal
                    });

                    if (!response.ok) throw new Error('Ошибка сети');
                    const photos = await response.json();

                    photos.forEach(photo => {
                        if (loadedPhotoIds.has(photo.id)) return;

                        const img = document.createElement('img');
                        img.src = photo.thumb;
                        img.className = 'blur-image';
                        img.onload = () => img.classList.add('loaded-image');

                        const marker = L.marker([photo.lat, photo.lng], {
                            icon: L.divIcon({
                                className: 'custom-marker',
                                html: `
                            <div class="marker-container">
                                ${img.outerHTML}
                                <div class="marker-badge">📷</div>
                            </div>
                        `
                            })
                        });

                        marker.on('click', function() {
                            const popupContent = document.createElement('div');
                            popupContent.className = 'photo-modal-content';

                            const imageContainer = document.createElement('div');
                            imageContainer.className = 'image-container';

                            if (cachedOriginals.has(photo.id)) {
                                const imgFull = new Image();
                                imgFull.src = cachedOriginals.get(photo.id);
                                imgFull.className = 'full-image loaded-image';
                                imageContainer.appendChild(imgFull);
                            } else {
                                const imgSmall = document.createElement('img');
                                imgSmall.src = photo.photourl_small;
                                imgSmall.className = 'blur-image preview-image';
                                imageContainer.appendChild(imgSmall);

                                const imgFull = new Image();
                                imgFull.className = 'full-image blur-image';
                                imgFull.onload = () => {
                                    cachedOriginals.set(photo.id, photo.photourl);
                                    imgFull.classList.add('loaded-image');
                                    imgSmall.style.opacity = '0';
                                };
                                imgFull.src = photo.photourl;
                                imageContainer.appendChild(imgFull);
                            }

                            popupContent.appendChild(imageContainer);

                            const modal = L.popup()
                                .setLatLng([photo.lat, photo.lng])
                                .setContent(popupContent)
                                .openOn(map);
                        });

                        markers.addLayer(marker);
                        loadedPhotoIds.add(photo.id);
                    });

                    map.addLayer(markers);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Ошибка загрузки:', err);
                        showErrorNotification('Ошибка загрузки данных');
                    }
                }
            }, 300);

            map.on('moveend', loadPhotos);
            map.on('zoomend', loadPhotos);
            map.on('dragend', loadPhotos);

            loadPhotos();

            function showErrorNotification(message) {
                const notification = document.createElement('div');
                notification.className = 'map-notification error';
                notification.textContent = message;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }
        </script>

        <style>
            .photo-modal-content {
                width: 250px;
                height: 250px;
            }

            .image-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }

            .preview-image,
            .full-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 250px;
                height: 250px;
                object-fit: cover;
                transition: all 0.5s ease-in-out;
            }

            .blur-image {
                filter: blur(20px);
                opacity: 1;
            }

            .loaded-image {
                filter: blur(0);
                opacity: 1;
            }

            .full-image {
                opacity: 0;
            }

            .full-image.loaded-image {
                opacity: 1;
            }

            .preview-image {
                transition: opacity 0.5s ease-in-out;
            }
        </style>
    </table>

</body>

</html>