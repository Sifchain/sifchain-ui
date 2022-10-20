import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { Plugin } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import liveReload from "vite-plugin-live-reload";

import svgLoader from "./scripts/vite-svg-loader";
import { vitePolyfills } from "./scripts/vite-polyfills";

// We turned off vite hmr because it's buggy, so we gotta add livereload.
const LR_EXTENSIONS = "js,json,ts,tsx,css,scss,html,vue,webp,jpg";

export default defineConfig({
  plugins: [
    vitePolyfills(),
    vueJsx(),
    vue(),
    (svgLoader as () => Plugin)(),
    liveReload(
      [
        `src/**/*.{${LR_EXTENSIONS}}`,
        `public/**/*.{${LR_EXTENSIONS}}`,
        `../core/src/**/*.{${LR_EXTENSIONS}}`,
        "index.html",
      ],
      {},
    ),
    createHtmlPlugin(),
  ].filter(Boolean),

  define: {
    TOKEN_SVG_PATH_LOOKUP: fs
      .readdirSync(path.resolve(__dirname, "./public/images/tokens"))
      .reduce(
        (acc, svgFilename) => ({
          ...acc,
          [svgFilename.replace(/\.svg$/i, "")]: `/images/tokens/${svgFilename}`,
        }),
        {},
      ),
  },

  optimizeDeps: {
    include: ["buffer", "process"],
  },
  build: {
    brotliSize: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: () => "everything.js",
      },
      plugins: [visualizer()],
    },
  },
  server: {
    hmr: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "/src"),
      stream: "stream-browserify",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "~/scss/typography.scss";
       @import "~/scss/variables.scss";
       @import "~/scss/mixins.scss";`,
      },
    },
  },
});
