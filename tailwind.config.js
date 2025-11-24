/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#2563eb',
        'button-detail': '#003366',
        'button-buy': '#CC0000',
      },
      fontFamily: {
        sans: ['Anuphan', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


