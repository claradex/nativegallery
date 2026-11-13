import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './MapMedia.css';
import { MapMediaClient } from './MapMediaClient';
import { redirect } from 'next/navigation';
import { siteContext } from '../site/SiteContext';

export async function MapMedia() {
  if (!(await siteContext()).viewer) redirect('/login');
  return <tr><td className="main">
    <h1>Map Media</h1>
    <div id="mapd"></div>
    <MapMediaClient />
  </td></tr>;
}
