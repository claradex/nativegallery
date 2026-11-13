'use client';

import { useEffect } from 'react';

const navigation: Record<string, string> = { ArrowLeft: 'a[rel="prev"]', ArrowRight: 'a[rel="next"]' };

function navigateByKey(event: KeyboardEvent) {
  if (!event.ctrlKey || event.defaultPrevented ||
      (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]'))) return;
  const link = navigation[event.key];
  const href = event.key === 'Home' ? '/' : link && document.querySelector(link)?.getAttribute('href');
  if (!href) return;
  event.preventDefault();
  window.location.assign(href);
}

function handleLink(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a');
  if (!link) return;
  if (link.matches('.mm-item[href="#"]')) event.preventDefault();
  if (link.classList.contains('self-close')) {
    event.preventDefault();
    window.open(link.href);
  }
}

function setFieldActive(event: FocusEvent, active: boolean) {
  const field = event.target instanceof Element && event.target.closest('.form-field');
  if (!field || (!active && event.relatedTarget instanceof Node && field.contains(event.relatedTarget))) return;
  field.classList.toggle('active', active);
  const label = field.previousElementSibling;
  if (label?.matches('.form-label')) label.classList.toggle('active', active);
}

function useAvatarFallback() {
  useEffect(() => {
    function fallback(image: HTMLImageElement) {
      image.removeAttribute('data-avatar-fallback');
      image.src = '/static/img/avatar.png';
    }
    function onError(event: Event) {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.hasAttribute('data-avatar-fallback')) fallback(image);
    }
    document.addEventListener('error', onError, true);
    for (const image of document.querySelectorAll<HTMLImageElement>('img[data-avatar-fallback]')) {
      if (image.complete && image.naturalWidth === 0) fallback(image);
    }
    return () => document.removeEventListener('error', onError, true);
  }, []);
}

export function SiteInteractions() {
  useAvatarFallback();
  useEffect(() => {
    const events = new AbortController();
    const options = { signal: events.signal };
    document.addEventListener('keydown', navigateByKey, options);
    document.addEventListener('click', handleLink, options);
    document.addEventListener('focusin', event => setFieldActive(event, true), options);
    document.addEventListener('focusout', event => setFieldActive(event, false), options);
    return () => events.abort();
  }, []);
  return null;
}
