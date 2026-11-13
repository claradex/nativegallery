import { createRequire } from 'node:module';
import { join } from 'node:path';

// Route handlers return legacy HTML documents and fragments with explicit HTTP statuses.
const load = createRequire(join(process.cwd(), 'package.json'));
export const { renderToStaticMarkup } = load('react-dom/server') as typeof import('react-dom/server');
