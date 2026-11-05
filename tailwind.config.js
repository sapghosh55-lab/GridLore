/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#08080c",
          900: "#0e0f17",
          850: "#141522",
          800: "#1d1f30",
          700: "#2a2d45",
          600: "#3d4163",
        },
        neon: {
          purple: "#8a2be2",
          cyan: "#00ffff",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 15px rgba(0, 255, 255, 0.45), inset 0 0 10px rgba(0, 255, 255, 0.2)",
        "neon-purple": "0 0 15px rgba(138, 43, 226, 0.55), inset 0 0 10px rgba(138, 43, 226, 0.25)",
        "neon-cyan-sm": "0 0 8px rgba(0, 255, 255, 0.4)",
        "neon-purple-sm": "0 0 8px rgba(138, 43, 226, 0.5)",
      },
    },
  },
  plugins: [],
};

