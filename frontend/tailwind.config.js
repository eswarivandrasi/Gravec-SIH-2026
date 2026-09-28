/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyclone: {
          navy: '#0b132b',
          dark: '#1c2541',
          slate: '#3a506b',
          teal: '#5bc0be',
          cyan: '#6fffe9',
          alert: '#e63946',
          warning: '#f4a261',
          success: '#2a9d8f',
        }
      }
    },
  },
  plugins: [],
}
