// /** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        BLUE: "#03369D",
      },
      fontFamily: {
      gabarito: ['Gabarito', 'sans-serif'],
      prompt: ['Prompt', 'sans-serif'],
      },
    },
  },
  plugins: [],
};