'use client';

export function MarkFollowedPhotos() {
  return <div className="mark-btn"><a className="button" href="#" onClick={event => {
    event.preventDefault();
    if (window.confirm('Действительно отметить эти фотографии просмотренными?')) {
      window.location.assign('/api/photo/checkall');
    }
  }}>Отметить все фотографии просмотренными</a></div>;
}
