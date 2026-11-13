import './ProfileSessions.css';
import { legacyDate, type ProfileSession } from '@nativegallery/contracts';

const icons = {
  device: 'M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z',
  time: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
};

function Icon({ path, className }: { path: string; className: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d={path} /></svg>;
}

export function ProfileSessions({ sessions }: { sessions: ProfileSession[] }) {
  return <div style={{ textAlign: 'left' }}>{sessions.map(session =>
    <div key={session.id} className={'session-card' + (session.current ? ' current' : '')}>
      <div className="card-header">
        <div className="device-info">
          <Icon path={icons.device} className="device-icon" />
          <div className="device-meta">
            <h3>{session.device || 'Неизвестное устройство'}</h3>
            <p className="os-version">{session.os}</p>
          </div>
        </div>
        <div className="session-status">{session.current ? 'Текущая сессия' : ''}</div>
      </div>
      <div className="card-details">
        <div className="detail-item"><Icon path={icons.time} className="icon" />{legacyDate(session.lastActivity)}</div>
      </div>
      {!session.current && <form method="post" action={'/api/profile/sessions/' + session.id + '/delete'} className="session-form">
        <button type="submit" className="delete-btn"><Icon path={icons.trash} className="trash-icon" />Завершить сессию</button>
      </form>}
    </div>)}
  </div>;
}
