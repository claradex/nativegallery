import type { Request } from 'express';

const systems: [RegExp, string | ((match: RegExpExecArray) => string)][] = [
  [/Windows NT 10/, 'Windows'],
  [/Windows NT 6\.3/, 'Windows 8.1'],
  [/Windows NT 6\.1/, 'Windows 7'],
  [/Windows/, 'Windows'],
  [/(?:iPhone|iPod).*? OS (\d+)/, match => 'iOS ' + match[1]],
  [/iPad.*? OS (\d+)/, match => 'iPadOS ' + match[1]],
  [/Android (\d+)/, match => 'Android ' + match[1]],
  [/Android/, 'Android'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
];

// Order matters: Chromium-based browsers also say "Chrome", and Chrome says "Safari".
const browsers: [RegExp, string][] = [
  [/YaBrowser\/(\d+)/, 'Яндекс Браузер'],
  [/Edg(?:e|A|iOS)?\/(\d+)/, 'Edge'],
  [/(?:OPR|Opera)\/(\d+)/, 'Opera'],
  [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
  [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
  [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
  [/Version\/(\d+).*Safari/, 'Safari'],
];

/** "Chrome 131" and "macOS" from a User-Agent; empty strings when it is not recognised. */
export function describeAgent(agent: string) {
  let os = '';
  for (const [pattern, name] of systems) {
    const match = pattern.exec(agent);
    if (match) { os = typeof name === 'string' ? name : name(match); break; }
  }
  let device = '';
  for (const [pattern, name] of browsers) {
    const match = pattern.exec(agent);
    if (match) { device = name + ' ' + match[1]; break; }
  }
  return { device: device.slice(0, 255), os: os.slice(0, 50) };
}

/**
 * Browser, OS and address of the client, as shown in «Безопасность». Requests reach the API through the Next.js
 * proxy, so the address comes from the first X-Forwarded-For entry; it is only displayed, never trusted for access.
 */
export function clientInfo(request: Request) {
  const forwarded = request.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = (forwarded || request.socket.remoteAddress || '').replace(/^::ffff:/, '').slice(0, 45);
  return { ...describeAgent(request.get('user-agent') ?? ''), ip };
}
