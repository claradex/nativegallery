const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/**
 * The `--theme-*` colours of the navbar and links derived from one colour, the way transphoto.org swaps in metro.css
 * on metro pages: the hover is the colour 20% brighter, visited links a greyer shade of it.
 */
export function navbarPalette(color: string | null | undefined): Record<string, string> | null {
  const match = color ? hex.exec(color) : null;
  if (!match) return null;
  const [r, g, b] = match.slice(1).map(part => parseInt(part, 16));
  const css = (rgb: number[]) => '#' + rgb.map(value => Math.round(value).toString(16).padStart(2, '0')).join('');
  const rgba = (rgb: number[], alpha: number) => `rgba(${rgb.map(Math.round).join(', ')}, ${alpha})`;
  const base = [r, g, b];
  const hover = base.map(value => Math.min(255, Math.max(value * 1.2, value + 12)));
  const grey = (r + g + b) / 3;
  const visited = base.map(value => Math.min(255, (value + grey) / 2 * 1.1));
  return {
    '--theme-bg-color': css(base),
    '--theme-bg-hover-color': css(hover),
    '--theme-link-color': css(base),
    '--theme-link-visited-color': css(visited),
    '--theme-link-hover-bg-color': rgba(base, 0.15),
    '--theme-link-underline-color': rgba(base, 0.3),
    '--theme-link-underline-visited-color': rgba(visited, 0.3),
    '--theme-preview-hover-bg-color': rgba(base, 0.7),
  };
}

export function navbarThemeCss(color: string | null | undefined) {
  const palette = navbarPalette(color);
  if (!palette) return null;
  // `:root:root` outranks both trans.css and the dark theme's `html[data-theme]` without relying on stylesheet order.
  return ':root:root {\n' + Object.entries(palette).map(([name, value]) => `  ${name}: ${value};\n`).join('') + '}';
}

/**
 * Recolours the navbar while the page that renders it is shown: an entity kind's navbar colour on its photos,
 * vehicles and models. A plain `<style>` (no `precedence`) stays where it is rendered and leaves with the page.
 */
export function NavbarTheme({ color }: { color: string | null | undefined }) {
  const css = navbarThemeCss(color);
  return css ? <style>{css}</style> : null;
}
