'use client';

import { refreshPage } from '../../components/navigation';
export function MarkFollowedPhotos() {
  return <div className="mark-btn"><a className="button" href="#" onClick={event => {
    event.preventDefault();
    if (window.confirm('Действительно отметить эти фотографии просмотренными?')) {
      // The API marks everything read and redirects to the followed-authors page.
      fetch('/api/photo/checkall', { cache: 'no-store' })
        .then(response => response.ok ? refreshPage() : Promise.reject(new Error()))
        .catch(() => window.alert('Не удалось отметить фотографии просмотренными.'));
    }
  }}>Отметить все фотографии просмотренными</a></div>;
}
