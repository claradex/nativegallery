import { renderToStaticMarkup } from '../../components/RenderMarkup';

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

export async function MapMedia(request: Request, api: string) {
  const response = await fetch(api + '/api/internal/viewer', {
    headers: { cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return new Response('Service Unavailable', { status: 503 });
  const { viewer } = await response.json();
  if (!viewer) return Response.redirect(new URL('/login', request.url), 302);
  const head = renderToStaticMarkup(<>
    <link rel="stylesheet" href={leaflet + 'leaflet.css'} />
    <link rel="stylesheet" href={cluster + 'MarkerCluster.css'} />
    <link rel="stylesheet" href={cluster + 'MarkerCluster.Default.css'} />
    <style>{styles}</style>
  </>);
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Map Media</h1>
    <div id="mapd"></div>
    <script src={leaflet + 'leaflet.js'} defer />
    <script src={cluster + 'leaflet.markercluster.js'} defer />
    <script src="/frontend-scripts/MapMedia.js" defer />
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__' + head + '</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}
