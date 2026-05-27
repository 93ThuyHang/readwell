/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#faf6f0',
        ink: '#1e1408',
        'ink-2': '#4a3728',
        'ink-3': '#9a7e68',
        'ink-4': '#c8b09a',
        border: '#e8ddd0',
        rust: '#b85020',
        'rust-s': '#fdeee6',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
