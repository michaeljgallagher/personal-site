/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          300: "#a89bc4",
          400: "#8975a8",
          500: "#67568c",
          600: "#564878",
        },
        ink: {
          50:  "#faf9fc",
          100: "#f3f1f7",
          200: "#e6e2ed",
          300: "#ccc6d6",
          400: "#9f99ad",
          500: "#756f85",
          600: "#56506a",
          700: "#423e52",
          800: "#2a2735",
          900: "#19171f",
          950: "#0d0b12",
        },
      },
    },
  },
  plugins: [],
};
