import { TourContent } from './TourContent';

export function Tour() {
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <TourContent title={title} />;
}
