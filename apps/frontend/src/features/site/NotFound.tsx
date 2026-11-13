'use client';

import './NotFound.css';
import { usePathname } from 'next/navigation';

export function NotFound() {
  return <div id="tracy-error"><div>
    <h1>Not Found</h1>
    <p>The requested page not found on server.</p><br />
    <pre>{usePathname()}</pre>
  </div></div>;
}
