
/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        "gradient-sweep": "gradient-sweep 2s linear infinite", // Reduced duration for faster effect
      },
      keyframes: {
        "gradient-sweep": {
          "0%": { "background-position": "0% 33%" },
          "50%": { "background-position": "33% 66%" },
          "100%": { "background-position": "66% 100%" },
        },
      },
      backgroundImage: {
        "sweep-gradient": "linear-gradient(90deg, transparent, #7474f4, transparent)", // custom gradient color
      },
    },
  },
  plugins: [
  ],
}