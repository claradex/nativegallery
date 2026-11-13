import { NotFound } from '../../features/site/NotFound';

export function GET(request: Request) {
  return NotFound(request);
}
