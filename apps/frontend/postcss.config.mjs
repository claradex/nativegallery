/**
 * Next's built-in PostCSS defaults (flexbugs fixes, preset-env with autoprefixer) stay as they were for the site
 * stylesheets; Tailwind only acts on the admin stylesheet, the one file that imports it.
 */
const config = {
  plugins: {
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': { autoprefixer: { flexbox: 'no-2009' }, stage: 3, features: { 'custom-properties': false } },
    '@tailwindcss/postcss': {},
  },
};

export default config;
