'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { bindUpload } from './UploadHandlers';
import { bindUploadMap } from './UploadMap';

export function UploadInteractions() {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const events = new AbortController();
    bindUpload(events.signal);
    return () => events.abort();
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const events = new AbortController();
    bindUploadMap(events.signal);
    return () => events.abort();
  }, [mapReady]);

  return <>
    <Script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" onReady={() => setMapReady(true)} />
    <Script src="/static/js/exif.js" />
  </>;
}
