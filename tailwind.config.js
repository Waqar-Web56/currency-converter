/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        ink: "#0C2A2B",
        deep: "#123F40",
        lagoon: "#1B6B67",
        mist: "#EEF3F0",
        sand: "#F8FAF7",
        lime: "#C8F169",
        coral: "#F26B5B"
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
