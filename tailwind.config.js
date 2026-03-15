/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#3b9ede',
          600: '#1e7fc0',
          700: '#1660a0',
          800: '#164e7a',
          900: '#0f3352',
        },
        coral: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      }
    },
  },
  plugins: [],
}
