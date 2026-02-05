/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f66bd",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
      },
      fontFamily: {
        display: ["Inter"],
      },
    },
  },
  plugins: [],
};
