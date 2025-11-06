/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nura', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#484041'
      }
    }
  },
  plugins: []
}
