import { Inter, PT_Sans_Narrow } from 'next/font/google';

/** Exposed as `--font-narrow`; the site stylesheets read it through `--narrow-font`. */
export const narrowFont = PT_Sans_Narrow({
  weight: ['400', '700'], subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-narrow',
});

export const interFont = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });
