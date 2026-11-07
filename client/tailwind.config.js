/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tripona: {
          arctic: "#A9DDF0",
          fjord: "#123B4A",
          midnight: "#061117",
          ocean: "#164C61",
          white: "#F5F7F7",
          surface: "rgba(18, 59, 74, 0.4)",
          border: "rgba(169, 221, 240, 0.15)",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        brand: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        'arctic': '0 0 35px -5px rgba(169, 221, 240, 0.3)',
        'ocean': '0 20px 50px -10px rgba(6, 17, 23, 0.85)',
      }
    },
  },
  plugins: [],
};
