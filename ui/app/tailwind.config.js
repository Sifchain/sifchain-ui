const SIDEBAR_WIDTH = "210px";

module.exports = {
  mode: "jit",
  // purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,svg}"],
  purge: {
    enabled: true,
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,svg}"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        "accent-gradient": `linear-gradient(180deg, #D4B553 0%, #C1A04F 100%);`,
      },
      screens: {
        portrait: { raw: "(orientation: portrait)" },
        shorter: { raw: "(max-height: 800px)" },
        // => @media (orientation: portrait) { ... }
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
      },
      spacing: {
        1: "8px",
        2: "12px",
        3: "16px",
        4: "20px",
        5: "24px",
        6: "28px",
        7: "32px",
        8: "48px",
        sidebar: SIDEBAR_WIDTH,
      },
      width: {
        sidebar: SIDEBAR_WIDTH,
      },
      inset: {
        sidebar: SIDEBAR_WIDTH,
      },
      colors: {
        accent: {
          // Tacha Gold
          base: "#D4B553",
          accent_gradient_to: "#C1A04F",
          dark: "#C1A04F",
        },
        info: {
          // Bright Boston Blue
          base: "#459FEE",
        },
        connected: {
          base: "#5AF37C",
        },
        danger: {
          base: "#FF4F4F",
          warning: "orange",
          bad: "#cccc0e",
        },
        gray: {
          // Ash Black
          100: "#171717",
          base: "#171717",

          action_button: "#191919",

          200: "#232323",
          input: "#232323",

          ring: "#272727",

          300: "#353535",
          input_outline: "#353535",

          500: "#565656",
          disabled: "#565656",

          600: "#636363",

          800: "#808080",

          850: "#AFAFAF",

          900: "#F9F9F9",
          active_outline: "#F9F9F9",
        },
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "26px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
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
  plugins: [],
};
