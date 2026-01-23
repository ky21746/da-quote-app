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
        // Legacy colors (keep for backward compatibility)
        'brand-gold': '#CAA131',
        'brand-dark': '#4B361C',
        'brand-olive': '#534B20',
        
        // Professional Safari Gold palette
        primary: {
          50: '#FDF8E8',
          100: '#F9EDBD',
          200: '#F5E292',
          300: '#F1D767',
          400: '#EDCC3C',
          500: '#CAA131', // Main brand gold
          600: '#A17F27',
          700: '#785F1D',
          800: '#4F3F13',
          900: '#261F09',
        },
        
        // Professional Earth tones
        earth: {
          50: '#F5F3F0',
          100: '#E8E3DC',
          200: '#D1C7B8',
          300: '#BAAB94',
          400: '#A38F70',
          500: '#8C734C',
          600: '#6B5838',
          700: '#534B20', // Brand olive
          800: '#3A3317',
          900: '#211C0D',
        },
        
        // Professional Safari accent (muted green)
        accent: {
          50: '#F0F7F4',
          100: '#D4E9DF',
          200: '#A9D3BF',
          300: '#7EBD9F',
          400: '#53A77F',
          500: '#2D8659',
          600: '#246B47',
          700: '#1B5035',
          800: '#123523',
          900: '#091A11',
        },
      },
    },
  },
  plugins: [],
}



