/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'brand-gold': '#CAA131',
        'brand-dark': '#4B361C',
        'brand-olive': '#534B20',
      },
    },
  },
  plugins: [],
}



