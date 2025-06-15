/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      colors: {
        'customNegro': '#08080C',
        'customBurbundy': '#770316',
        'customRed': '#BF0D22',
        'customGrisOscurso': '#444E5F',
        'customGrisMedio': '#A0A4AD',
        'customGrisClaro': '#CCCBCB',
        'customGrisClaro2': '#E5E5E5',
        'customBlanco': '#FBFAFA',



      },
      fontFamily: {
        medula: ['"Medula One"', 'sans-serif'],
      },
      backdropBlur: {
        '20': '20px',
      },
    },

  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

