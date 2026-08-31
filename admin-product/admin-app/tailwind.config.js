/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Strict grayscale — no other hues. Back-office tool feel: crisp
      // whites, fine gray borders, dense tables.
      colors: {
        ink: {
          DEFAULT: '#1A1A1A',
          900: '#0A0A0A', 800: '#1A1A1A', 700: '#2E2E2E', 600: '#4D4D4D',
          500: '#6B6B6B', 400: '#8C8C8C', 300: '#B3B3B3', 200: '#D6D6D6',
          100: '#E8E8E8', 50: '#F2F2F2',
        },
        surface: { DEFAULT: '#FFFFFF', sunken: '#F7F7F6', rail: '#111111' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
