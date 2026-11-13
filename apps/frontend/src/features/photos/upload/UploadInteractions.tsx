'use client';

import { useEffect } from 'react';
import { loadLeaflet } from '../MapMediaClient';
import { bindUpload } from './UploadHandlers';
import { bindUploadMap } from './UploadMap';

export function UploadInteractions() {
  useEffect(() => {
    const events = new AbortController();
    bindUpload(events.signal);
    loadLeaflet().then(L => { if (!events.signal.aborted) bindUploadMap(events.signal, L); });
    return () => events.abort();
  }, []);
  return null;
}
