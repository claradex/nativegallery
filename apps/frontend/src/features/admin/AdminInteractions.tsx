'use client';

import { useEffect } from 'react';

const interactions = {
  AdminContests: () => import('./interactions/AdminContests'),
  AdminEntities: () => import('./interactions/AdminEntities'),
  AdminGeo: () => import('./interactions/AdminGeo'),
  AdminModelCreate: () => import('./interactions/AdminModelCreate'),
  AdminModels: () => import('./interactions/AdminModels'),
  AdminNews: () => import('./interactions/AdminNews'),
  AdminPages: () => import('./interactions/AdminPages'),
  AdminPhotos: () => import('./interactions/AdminPhotos'),
  AdminSettings: () => import('./interactions/AdminSettings'),
  AdminUsers: () => import('./interactions/AdminUsers'),
};

export type AdminSection = keyof typeof interactions;

/** Bootstrap's data-API (modals, dropdowns) binds itself to the document once the bundle is evaluated. */
export function AdminBootstrap() {
  useEffect(() => { import('bootstrap/dist/js/bootstrap.bundle.min.js'); }, []);
  return null;
}

export function AdminInteractions({ section }: { section: AdminSection }) {
  useEffect(() => {
    const events = new AbortController();
    interactions[section]().then(({ bind }) => {
      if (!events.signal.aborted) bind(events.signal);
    }).catch(error => {
      if (!events.signal.aborted) console.error(error);
    });
    return () => events.abort();
  }, [section]);

  return null;
}
