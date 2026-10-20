/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07070d",
        hot: "#ff2e88",
        ice: "#20e3ff",
        lime: "#b6ff3c",
        sun: "#ffb020",
      },
      fontFamily: { sans: ["var(--font-grotesk)", "system-ui", "sans-serif"] },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
      },
      animation: { shimmer: "shimmer 1.8s linear infinite" },
    },
  },
  plugins: [],
};
