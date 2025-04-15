/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
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
    },

  },
  plugins: [],
}

