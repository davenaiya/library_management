/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F7F0E7",
          100: "#ECDDCA",
          200: "#DEC7AB",
          300: "#D0B28D",
          400: "#C39D74",
          500: "#AF8B64",
          600: "#957252",
          700: "#7C5D45",
          800: "#644A37",
          900: "#4C382B"
        },
        secondary: {
          50: "#FAF4EC",
          100: "#F0E1D0",
          200: "#E4CEB2",
          300: "#D7BB95",
          400: "#C8A57D",
          500: "#B69268",
          600: "#9C7855",
          700: "#7F6146"
        },
        danger: {
          50: "#FBF1EA",
          100: "#F1DDD0",
          500: "#BC8766",
          600: "#A56F52"
        },
        app: {
          bg: "#EBE1D4",
          card: "#FFF9F2",
          text: "#453A31",
          muted: "#7B6A59",
          border: "#DEC7AB",
          sidebar: "#7C5D45",
          sidebarSoft: "#957252",
          accent: "#AF8B64"
        }
      },
      boxShadow: {
        soft: "0 20px 40px rgba(110, 89, 67, 0.18)",
        panel: "0 16px 36px rgba(110, 89, 67, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
