const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: withOpacity('--color-brand-primary'),
          secondary: withOpacity('--color-brand-secondary'),
          accent: withOpacity('--color-brand-accent'),
          dark: withOpacity('--color-brand-dark'),
          light: withOpacity('--color-brand-light'),
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        luxe: 'var(--shadow-luxe)',
      },
      backgroundImage: {
        'hero-mesh': 'var(--hero-mesh)',
      },
    },
  },
  plugins: [],
}