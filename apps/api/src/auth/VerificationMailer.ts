import { createTransport } from 'nodemailer';

export function verificationMailer() {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASSWORD: pass, SMTP_FROM: from, SITE_ORIGIN: origin } = process.env;
  const port = Number(process.env.SMTP_PORT || 465);
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
        subject: 'Подтверждение регистрации | ' + (process.env.SITE_TITLE ?? 'NativeGallery'),
        text: 'Подтвердите адрес электронной почты: ' + link.href + '\nЕсли вы не регистрировались, проигнорируйте письмо.',
      });
    },
  };
}
