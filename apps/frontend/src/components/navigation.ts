/**
 * Client-side navigation shared by React components and the plain DOM handlers in `features/**`.
 * `ClientNavigation` connects the App Router here; until it mounts (or outside the app) the helpers fall back to
 * ordinary page loads.
 */

export interface PageRouter {
  push(href: string): void;
  replace(href: string): void;
  refresh(): void;
}

let router: PageRouter | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function connectRouter(next: PageRouter | null) {
  router = next;
}

/** Closes open Bootstrap modals first: a soft refresh keeps the DOM, so an open dialog and its backdrop would stay. */
function closeModals() {
  for (const button of document.querySelectorAll<HTMLElement>('.modal.show [data-bs-dismiss="modal"]')) button.click();
}

/**
 * Goes to `href` without reloading the page; a URL outside the site still gets a normal page load.
 * `refresh` also re-renders the shared layout (the menu bar), which a plain navigation keeps as it was:
 * use it after signing in or anything else that changes the viewer.
 */
export function navigate(href: string, { replace = false, refresh = false } = {}) {
  const url = new URL(href, window.location.href);
  if (!router || url.origin !== window.location.origin || !routable(url)) {
    if (replace) window.location.replace(url.href);
    else window.location.assign(url.href);
    return;
  }
  closeModals();
  const path = url.pathname + url.search + url.hash;
  if (refresh) router.refresh();
  if (replace) router.replace(path);
  else router.push(path);
}

/** Re-renders the current page with fresh server data, keeping scroll position and client state. */
export function refreshPage() {
  if (!router) return window.location.reload();
  closeModals();
  router.refresh();
}

/** Paths served by the API or as files: they need a real request, not an App Router navigation. */
const fileOrApi = /^\/(?:api|uploads|static|_next)\/|^\/(?:logout|set\.php|robots\.txt|favicon\.ico)$/;

export function routable(url: URL) {
  return url.origin === window.location.origin && !fileOrApi.test(url.pathname);
}

/** Bumped after every navigation and every finished refresh, so DOM handlers can bind to the new markup. */
export function pageVersion() {
  return version;
}

export function subscribePage(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function pageChanged() {
  version += 1;
  for (const listener of listeners) listener();
}
