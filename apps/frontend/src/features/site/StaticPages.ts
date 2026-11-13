import { escapeHtml } from '../../components/Html';
import { readTemplate } from '../../components/ReadTemplate';

export function Tour() {
  return readTemplate('src/features/site/Tour.html').replace('__TITLE__',
    () => escapeHtml(process.env.SITE_TITLE ?? 'NativeGallery'));
}

export { NotFound } from './NotFound';
