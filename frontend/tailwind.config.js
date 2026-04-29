// /** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
      "loading-bar": {
        "0%":   { transform: "translateX(-100%)", width: "40%" },
        "50%":  { width: "60%" },
        "100%": { transform: "translateX(300%)", width: "40%" },
      },
      "loading-dot": {
        "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
        "50%":      { opacity: "1",   transform: "scale(1.3)" },
      },
    },
    animation: {
      "loading-bar": "loading-bar 1.4s cubic-bezier(0.4,0,0.6,1) infinite",
      "loading-dot": "loading-dot 1.2s ease-in-out infinite",
    },
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

