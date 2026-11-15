import { send } from '../lib/request';

export const publishKinds = ['Нормальная публикация', 'Условная публикация', 'Временная публикация', 'Техническая публикация'];
/** Decline reasons are stored as 1-based codes. */
export const declineReasons = ['Малоинформативный бред', 'Не подходит для сайта', 'Порнография', 'Травля/издевательство над человеком', 'Расчленёнка', 'Файл сломан'];

export interface PendingPhoto {
  id: number; photourl: string; place: string; postbody: string; user_id: number; username: string; posted_at: number; timeupload: number; gallery_id: number;
}

/** `mod`: 1 publishes, 2 declines, 0 puts the photo back into the queue. */
export function decide(id: number, mod: 0 | 1 | 2, { reason, irate, krate, comment }: { reason?: string; irate?: string; krate?: string; comment?: string } = {}) {
  const query = new URLSearchParams({ id: String(id), mod: String(mod) });
  if (reason !== undefined) query.set('reason', reason);
  if (irate !== undefined) query.set('irate', irate);
  if (krate !== undefined) query.set('krate', krate);
  return send('/api/admin/images/setvisibility?' + query, { body: { comment: comment ?? '' }, fallback: 'Не удалось сохранить решение по фотографии.' });
}
