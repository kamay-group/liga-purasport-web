/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/**/*.js", "./build.mjs"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#00A8E3", ink: "#0079A6", soft: "#E6F7FD" },
        night: { DEFAULT: "#0E1116", 800: "#151A21", 700: "#1C232C", 600: "#2A333F" },
        slate2: "#8B98A9",
      },
      fontFamily: {
        display: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
