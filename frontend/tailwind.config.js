/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'engineering-blue': '#0066CC',
        'calculation-green': '#00AA44',
        'error-red': '#DC3545',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
