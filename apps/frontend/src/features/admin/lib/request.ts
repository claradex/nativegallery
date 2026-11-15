'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { refreshPage } from '../../../components/navigation';

export class RequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type Body = URLSearchParams | FormData | Record<string, string | number | boolean | undefined | null>;

function encode(body?: Body) {
  if (!body || body instanceof URLSearchParams || body instanceof FormData) return body;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) if (value !== undefined && value !== null) params.set(key, String(value));
  return params;
}

/** A readable reason from the API's error body, if it sent one in Russian. */
function reason(reply: unknown, fallback: string) {
  if (reply && typeof reply === 'object' && 'message' in reply) {
    const message = (reply as { message: unknown }).message;
    if (typeof message === 'string' && /[а-яё]/i.test(message)) return message;
  }
  return fallback;
}

/**
 * Calls an admin endpoint. Legacy endpoints answer `{"error":0}` (as text/html) on success; form endpoints answer with
 * a redirect to an admin page, which is not followed (`redirect: 'manual'`) since only the outcome matters.
 */
export async function send<T = unknown>(url: string, { method = 'POST', body, fallback = 'Не удалось выполнить действие.' }:
  { method?: string; body?: Body; fallback?: string } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { method, body: encode(body), redirect: 'manual', cache: 'no-store' });
  } catch {
    throw new RequestError('Нет связи с сервером. Проверьте подключение.', 0);
  }
  if (response.type === 'opaqueredirect') return undefined as T;
  const text = await response.text();
  let reply: unknown = undefined;
  try { reply = text ? JSON.parse(text) : undefined; } catch {}
  if (!response.ok) {
    const messages: Record<number, string> = { 403: 'Недостаточно прав для этого действия.', 404: 'Запись не найдена: возможно, её уже удалили.' };
    throw new RequestError(reason(reply, messages[response.status] ?? fallback), response.status);
  }
  if (reply && typeof reply === 'object' && 'error' in reply && (reply as { error: unknown }).error !== 0) {
    throw new RequestError(fallback, response.status);
  }
  return reply as T;
}

/**
 * Runs an admin action with a pending flag, a toast for the outcome and (unless `refresh: false`) a soft refresh of
 * the server-rendered page so lists and counters update in place.
 */
export function useAction() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async <T,>(action: () => Promise<T>, { success, refresh = true }:
    { success?: string; refresh?: boolean } = {}) => {
    setPending(true);
    try {
      const result = await action();
      if (success) toast.success(success);
      if (refresh) refreshPage();
      return { ok: true as const, result };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось выполнить действие.');
      return { ok: false as const };
    } finally {
      setPending(false);
    }
  }, []);
  return [pending, run] as const;
}
