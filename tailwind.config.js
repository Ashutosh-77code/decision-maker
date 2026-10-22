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
        // NEW: Added a subtle dark surface color for cards/panels
        surface: "#12121a", 
      },
      fontFamily: { sans: ["var(--font-grotesk)", "system-ui", "sans-serif"] },
      // NEW: Added glowing shadows to match your neon color palette
      boxShadow: {
        'glow-hot': '0 0 20px -5px rgba(255, 46, 136, 0.4)',
        'glow-ice': '0 0 20px -5px rgba(32, 227, 255, 0.4)',
      },
      // NEW: Added a larger border radius for modern pill-shaped buttons
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        // NEW: Added a smooth floating animation
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: { 
        shimmer: "shimmer 1.8s linear infinite",
        // NEW: Hooked up the float animation
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
