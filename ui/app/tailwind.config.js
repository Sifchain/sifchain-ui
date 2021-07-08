module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        "accent-gradient": `linear-gradient(180deg, #D4B553 0%, #C1A04F 100%);`,
      },
      fontFamily: {
        DEFAULT: "sans",
        sans: [
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          "sans-serif",
        ],
        mono: [
          'Roboto Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"',
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
      },
      width: {
        sidebar: "210px",
      },
      inset: {
        sidebar: "210px",
      },
      colors: {
        accent: {
          // Tacha Gold
          base: "#D4B553",
          accent_gradient_to: "#C1A04F",
        },
        info: {
          // Bright Boston Blue
          base: "#459FEE",
        },
        connected: {
          // Ash Black
          base: "#39C357",
        },
        gray: {
          // Ash Black
          100: "#171717",
          base: "#171717",

          200: "#232323",
          input: "#232323",

          300: "#353535",
          input_outline: "#353535",

          500: "#565656",
          disabled: "#565656",

          600: "#666",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
