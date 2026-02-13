/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2f6bff",
        "primary-strong": "#1f52de",
        "primary-soft": "#6fa2ff",
        "background-light": "#f2f6fc",
        "background-dark": "#081328",
        "card-dark": "#0f1c33",
        "dashboard-card": "#1a2233",
        "border-dark": "#21324e",
        "text-muted": "#8ea2c5",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        panel: "0 24px 60px -30px rgba(5, 10, 24, 0.9)",
      },
    },
  },
  plugins: [],
};
