'use client';

import { Suspense, useEffect, useLayoutEffect, useSyncExternalStore, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { connectRouter, navigate, pageChanged, pageVersion, refreshPage, routable, subscribePage } from './navigation';

/** Re-runs DOM bindings after each client navigation and finished refresh: use it as an effect dependency. */
export function usePageVersion() {
  return useSyncExternalStore(subscribePage, pageVersion, () => 0);
}

let progressTimer = 0;

function progress(state: 'start' | 'done') {
  const bar = document.querySelector<HTMLElement>('.progress-bard');
  if (!bar) return;
  window.clearTimeout(progressTimer);
  if (state === 'start') {
    bar.style.transition = '';
    bar.style.width = '70%';
    // A click a page handler cancelled never finishes a navigation, so the bar must not wait forever.
    progressTimer = window.setTimeout(() => progress('done'), 8000);
    return;
  }
  if (bar.style.width === '' || bar.style.width === '0%') return;
  bar.style.width = '100%';
  progressTimer = window.setTimeout(() => {
    bar.style.transition = 'none';
    bar.style.width = '0%';
  }, 300);
}

function followableLink(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
  const url = new URL(link.href, window.location.href);
  if (!routable(url)) return null;
  // Same-page anchors (including the `href="#"` placeholders of script buttons) keep the browser's own behaviour.
  const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
  if (samePage && (url.hash || link.getAttribute('href')?.includes('#'))) return null;
  return url;
}

/** Signing out clears the session cookies in the background, then re-renders the menu bar for a guest. */
function signOut(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || link.origin !== window.location.origin || link.pathname !== '/logout') return false;
  event.preventDefault();
  progress('start');
  // The redirect itself does not matter: its Set-Cookie headers are applied either way.
  fetch(link.href, { redirect: 'manual', cache: 'no-store' })
    .then(() => navigate('/', { refresh: true }))
    .catch(() => window.location.assign(link.href));
  return true;
}

/** Links rendered as HTML strings (comments, pages, legacy markup) do not go through next/link. */
function onClick(event: MouseEvent) {
  if (signOut(event)) return;
  const url = followableLink(event);
  if (!url) return;
  progress('start');
  if (event.defaultPrevented) return; // next/link (or a page handler) already took care of it
  event.preventDefault();
  navigate(url.href);
}

function errorMessage(body: unknown) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && /[а-яё]/i.test(message)) return message;
  }
  return 'Не удалось выполнить действие. Попробуйте ещё раз.';
}

async function postForm(form: HTMLFormElement, submitter: HTMLElement | null, url: URL) {
  const data = new FormData(form, submitter);
  const multipart = (form.getAttribute('enctype') ?? '').toLowerCase() === 'multipart/form-data';
  const body = multipart ? data : new URLSearchParams([...data].map(([key, value]) => [key, String(value)]));
  const buttons = [...form.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input[type="submit"]')]
    .filter(button => !button.disabled);
  form.dataset.pending = 'true';
  for (const button of buttons) button.disabled = true;
  progress('start');
  try {
    const response = await fetch(url, { method: 'POST', body });
    if (!response.ok) {
      const reply = await response.json().catch(() => null);
      progress('done');
      window.alert(errorMessage(reply));
      return;
    }
    // A page load would have rendered the form afresh; a soft refresh keeps the DOM, so the typed values are
    // dropped by hand (fields fall back to their defaults, which the refresh then updates).
    form.reset();
    // The API answers form posts with a redirect to the page that shows the result; fetch has followed it already.
    const target = response.redirected ? new URL(response.url) : null;
    const here = window.location.pathname + window.location.search;
    if (target && routable(target) && target.pathname + target.search !== here) navigate(target.href);
    else refreshPage();
  } catch {
    progress('done');
    window.alert('Не удалось отправить данные. Проверьте подключение и попробуйте ещё раз.');
  } finally {
    delete form.dataset.pending;
    for (const button of buttons) button.disabled = false;
  }
}

/** Plain forms (no handler of their own) submit in the background instead of loading the API's response page. */
function onSubmit(event: SubmitEvent) {
  const form = event.target;
  if (event.defaultPrevented || !(form instanceof HTMLFormElement) || form.hasAttribute('data-native')) return;
  if (form.target && form.target !== '_self') return;
  const submitter = event.submitter instanceof HTMLElement ? event.submitter : null;
  const method = (submitter?.getAttribute('formmethod') ?? form.getAttribute('method') ?? 'get').toLowerCase();
  const url = new URL(submitter?.getAttribute('formaction') ?? form.action, window.location.href);
  if (url.origin !== window.location.origin) return;

  if (method === 'get') {
    if (!routable(url)) return;
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [key, value] of new FormData(form, submitter)) if (typeof value === 'string') query.append(key, value);
    url.search = query.toString();
    navigate(url.href);
    return;
  }
  if (method !== 'post' || !url.pathname.startsWith('/api/')) return;
  event.preventDefault();
  if (form.dataset.pending) return;
  void postForm(form, submitter, url);
}

function PageChanges() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useLayoutEffect(() => {
    pageChanged();
    progress('done');
  }, [pathname, search]);
  return null;
}

/**
 * Mounted once per root layout: routes links and plain forms through the App Router so the page is not reloaded,
 * and exposes `navigate`/`refreshPage` to the DOM handlers.
 */
export function ClientNavigation() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    connectRouter({
      push: href => startTransition(() => router.push(href)),
      replace: href => startTransition(() => router.replace(href)),
      refresh: () => startTransition(() => router.refresh()),
    });
    return () => connectRouter(null);
  }, [router]);

  useEffect(() => {
    if (pending) return progress('start');
    pageChanged();
    progress('done');
  }, [pending]);

  useEffect(() => {
    // Window listeners run after every document-level handler, so page scripts and next/link get the first say.
    const events = new AbortController();
    window.addEventListener('click', onClick, { signal: events.signal });
    window.addEventListener('submit', onSubmit, { signal: events.signal });
    return () => events.abort();
  }, []);

  return <Suspense fallback={null}><PageChanges /></Suspense>;
}
