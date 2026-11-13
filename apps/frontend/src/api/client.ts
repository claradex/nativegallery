import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

/** Origin of the external NestJS API. The frontend never serves API routes itself. */
import { apiOrigin } from './origin';

export { apiOrigin };

/** Cookie header of the incoming request, read once per render. */
export const requestCookie = cache(async () => (await headers()).get('cookie') ?? '');

export function readCookie(cookie: string | null | undefined, name: string) {
  for (const part of (cookie ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0 && part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return undefined;
}

export interface ApiRequest extends RequestInit {
  /** Forward the visitor's session cookie to the API. */
  auth?: boolean;
}

/** Raw API call; resolves to `null` when the API is unreachable. */
export async function apiFetch(path: string, { auth, headers: extra, ...init }: ApiRequest = {}) {
  const requestHeaders = new Headers(extra);
  if (auth) requestHeaders.set('cookie', await requestCookie());
  return fetch(apiOrigin + path, { cache: 'no-store', ...init, headers: requestHeaders }).catch(() => null);
}

export interface ApiLoad extends ApiRequest {
  /** Message of the error thrown for any other failed response. */
  error?: string;
  /** Redirect to the login page when the API answers 403. */
  login?: boolean;
  /** Render the not-found page when the API answers 404. */
  missing?: boolean;
}

/** Loads JSON for a server component, mapping API statuses onto Next navigation. */
export async function apiGet<T>(path: string, { error = 'Could not load this page', login, missing, ...init }: ApiLoad = {}) {
  const response = await apiFetch(path, init);
  if (login && response?.status === 403) redirect('/login');
  if (missing && response?.status === 404) notFound();
  if (!response?.ok) throw new Error(error);
  return response.json() as Promise<T>;
}

/** Like `apiGet`, but resolves to `null` instead of failing when the API answers 404. */
export async function apiFind<T>(path: string, { error = 'Could not load this page', login, ...init }: ApiLoad = {}) {
  const response = await apiFetch(path, init);
  if (login && response?.status === 403) redirect('/login');
  if (response?.status === 404) return null;
  if (!response?.ok) throw new Error(error);
  return response.json() as Promise<T>;
}

export const isId = (value: unknown): value is string => typeof value === 'string' && /^\d{1,10}$/.test(value);
