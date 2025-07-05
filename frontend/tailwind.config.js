/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'well-primary': '#cbb26a',
        'well-light': '#d8c690', 
        'well-dark': '#be9e44',
      },
    },
  },
  plugins: [],
}
