/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          brand: '#166534',
          dark: '#14532d',
          light: '#dcfce7'
        }
      }
    },
  },
  plugins: [],
};
