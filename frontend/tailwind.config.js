/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cozy: {
          light: '#FFF9F0',
          main: '#FDBA74',
        }
      }
    },
  },
  plugins: [],
}