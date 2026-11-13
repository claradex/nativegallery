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
