/** Mirrors the API's admin levels: 1 administrator, 2 photo moderator, 3 (and any other non-zero) editor. */
export type AdminRole = 'moderator' | 'editor' | 'owner';

export function can(admin: number, role: AdminRole) {
  if (role === 'owner') return admin === 1;
  if (role === 'editor') return admin !== 0 && admin !== 2;
  return admin !== 0;
}

export const roleNames: Record<number, string> = { 0: 'Пользователь', 1: 'Администратор', 2: 'Фотомодератор', 3: 'Модератор' };
