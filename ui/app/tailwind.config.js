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
        // => @media (orientation: portrait) { ... }
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
          base: "#5AF37C",
        },
        danger: {
          base: "#FF4F4F",
        },
        gray: {
          // Ash Black
          100: "#171717",
          base: "#171717",

          200: "#232323",
          input: "#232323",

          ring: "#272727",

          300: "#353535",
          input_outline: "#353535",

          500: "#565656",
          disabled: "#565656",

          600: "#636363",

          800: "#808080",
        },
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
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
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
