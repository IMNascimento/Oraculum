module.exports = {
  // A API do plugin PostCSS do Tailwind foi movida para `@tailwindcss/postcss`.
  // Use require() para garantir compatibilidade com a versão local.
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
