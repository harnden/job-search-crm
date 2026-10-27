/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"DM Sans"', 'sans-serif'], sans: ['Inter', 'sans-serif'], mono: ['"IBM Plex Mono"', 'monospace'] },
      colors: { ink: '#1c2522', sage: '#49685b', parchment: '#f7f6f1', line: '#d9ddd5' },
      boxShadow: { card: '0 2px 5px rgba(27, 39, 32, .06), 0 12px 28px rgba(27, 39, 32, .04)' },
    },
  },
  plugins: [],
}
