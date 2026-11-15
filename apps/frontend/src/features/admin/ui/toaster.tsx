'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return <Sonner position="bottom-right" richColors closeButton theme="system" containerAriaLabel="Уведомления" toastOptions={{
    style: { fontFamily: 'inherit' }, closeButtonAriaLabel: 'Закрыть уведомление',
  }} />;
}
