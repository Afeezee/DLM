/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8C6A3B',
          secondary: '#D8C6A6',
          accent: '#B6542D',
          dark: '#16120D',
          light: '#F7F2EB',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 24px 80px rgba(22, 18, 13, 0.12)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(circle at top left, rgba(140, 106, 59, 0.18), transparent 40%), radial-gradient(circle at bottom right, rgba(182, 84, 45, 0.16), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.92), rgba(247,242,235,0.88))',
      },
    },
  },
  plugins: [],
}