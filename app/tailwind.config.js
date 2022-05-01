const SIDEBAR_WIDTH = "210px";

/**
 * @type {import("tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,svg}"],
  darkMode: "media",
  theme: {
    extend: {
      backgroundImage: {
        "accent-gradient": `linear-gradient(180deg, #D4B553 0%, #C1A04F 100%);`,
      },
      screens: {
        shorter: {
          raw: "(max-height: 900px)",
        },
      },
      fontFamily: {
        DEFAULT: "sans",
        sans: [
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          "sans-serif",
        ],
        mono: [
          '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"',
          "monospace",
        ],
        noatan: ["Noatan"],
      },
      spacing: {
        sidebar: SIDEBAR_WIDTH,
      },
      width: {
        sidebar: SIDEBAR_WIDTH,
      },
      inset: {
        sidebar: SIDEBAR_WIDTH,
      },
      colors: {
        white: "#e6e6e6",
        black: "rgb(12, 17, 19)",
        accent: {
          // Tacha Gold
          base: "#D4B553",
          accent_gradient_to: "#C1A04F",
          muted: "#A98929",
          dark: "#C1A04F",
          light: "#FFE8A0",
        },
        info: {
          // Bright Boston Blue
          base: "#459FEE",
        },
        connected: {
          base: "#00db9d",
        },
        danger: {
          base: "#ff4d67",
          warning: "orange",
          bad: "#cccc0e",
        },
        gray: {
          action_button: "#191919",
          input: "#232323",
          input_outline: "#353535",
          active_outline: "#F9F9F9",
          disabled: "#565656",
          ring: "#272727",
          base: "#171717",
        },
      },
      fontSize: {},
      borderRadius: {},
      animation: {
        "fade-in": "fadeIn 150ms ease-out 1",
        "fade-in-up": "fadeInUp 200ms ease-out 1",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(1%) scale(1)" },
          "100%": { opacity: "1", transform: "translateY(0%) scale(1)" },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
