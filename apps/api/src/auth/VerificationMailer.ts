import { createTransport } from 'nodemailer';
import { setting } from '@nativegallery/config';

export function verificationMailer() {
  const [host, user, pass, from, origin] = (['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'SITE_ORIGIN'] as const).map(setting);
  const port = Number(setting('SMTP_PORT'));
  if (!host || !from || !origin || !Number.isInteger(port) || port < 1 || port > 65535 || Boolean(user) !== Boolean(pass)) return null;
  let site: URL;
  try { site = new URL(origin); } catch { return null; }
  if (!['https:', 'http:'].includes(site.protocol)) return null;
  return {
    async send(email: string, token: string) {
      const link = new URL('/api/users/emailverify', site);
      link.searchParams.set('token', token);
      const transport = createTransport({
        host, port, secure: port === 465, requireTLS: port !== 465,
        auth: user && pass ? { user, pass } : undefined,
        connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
      });
      await transport.sendMail({
        from, to: email,
        subject: 'Подтверждение регистрации | ' + setting('SITE_TITLE'),
        text: 'Подтвердите адрес электронной почты: ' + link.href + '\nЕсли вы не регистрировались, проигнорируйте письмо.',
      });
    },
  };
}
