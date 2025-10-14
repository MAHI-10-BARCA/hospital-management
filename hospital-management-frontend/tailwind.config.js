/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          50: '#f3f8ff',
          100: '#e6f0ff',
          300: '#7fb3ff',
          500: '#1e6fff', // primary
          600: '#1657d6',
          800: '#0c2f66'
        },
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(19, 38, 76, 0.08)',
      }
    },
  },
  plugins: [],
}
