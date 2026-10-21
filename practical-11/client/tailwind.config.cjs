/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./theme/tailwind.preset.cjs')],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
};
