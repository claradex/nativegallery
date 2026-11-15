import { TourContent } from './TourContent';
import { setting } from '@nativegallery/config';

export function Tour() {
  const title = setting('SITE_TITLE');
  return <TourContent title={title} />;
}
