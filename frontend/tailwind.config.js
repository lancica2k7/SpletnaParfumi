/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          primary: '#f8b4b4',
          secondary: '#c084fc',
          accent: '#22d3ee',
        },
      },
    },
  },
  plugins: [],
};

