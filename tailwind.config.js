// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{tsx,html}"],
//   darkMode: "media",
//   prefix: "plasmo-"
// }
const withMT = require("@material-tailwind/react/utils/withMT")

module.exports = withMT({
  content: ["./src/**/*.{tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#a0d3c4"
      }
    }
  },
  plugins: []
})
