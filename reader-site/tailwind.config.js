/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Strict grayscale palette — NO other hues anywhere (project constraint).
      colors: {
        ink: {
          DEFAULT: '#1A1A1A', // primary charcoal text
          900: '#0A0A0A',
          800: '#1A1A1A',
          700: '#2E2E2E',
          600: '#4D4D4D',
          500: '#6B6B6B',
          400: '#8C8C8C',
          300: '#B3B3B3',
          200: '#D6D6D6',
          100: '#E8E8E8',
        },
        paper: {
          DEFAULT: '#F5F3EF', // warm off-white background
          pure: '#FBFAF8',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,26,26,0.06), 0 8px 24px rgba(26,26,26,0.05)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
