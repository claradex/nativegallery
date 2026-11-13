import { MapMediaClient } from './MapMediaClient';
import { redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';

const leaflet = 'https://unpkg.com/leaflet@1.7.1/dist/';
const cluster = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/';
const styles = `
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
`;

export async function MapMedia() {
  if (!(await siteContext()).viewer) redirect('/login');
  return <tr><td className="main">
    <link rel="stylesheet" href={leaflet + 'leaflet.css'} />
    <link rel="stylesheet" href={cluster + 'MarkerCluster.css'} />
    <link rel="stylesheet" href={cluster + 'MarkerCluster.Default.css'} />
    <style>{styles}</style>
    <h1>Map Media</h1>
    <div id="mapd"></div>
    <MapMediaClient leaflet={leaflet} cluster={cluster} />
  </td></tr>;
}
