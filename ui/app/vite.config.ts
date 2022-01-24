import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgLoader from "./scripts/vite-svg-loader";
import { minifyHtml } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import { vitePolyfills } from "./scripts/vite-polyfills";

// We turned off vite hmr because it's buggy, so we gotta add livereload.
import liveReload from "vite-plugin-live-reload";
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
    // viteSingleFile(),
    minifyHtml(),
  ].filter(Boolean),

  define: {
    TOKEN_SVG_PATH_LOOKUP: fs
      .readdirSync(path.resolve(__dirname, "./public/images/tokens"))
      .reduce((acc, svgFilename) => {
        acc[
          svgFilename.replace(/\.svg$/i, "")
        ] = `/images/tokens/${svgFilename}`;
        return acc;
      }, {}),
  },

  optimizeDeps: {
    include: ["buffer", "process"],
  },
  build: {
    brotliSize: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // inlineDynamicImports: true,
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
      "@": path.resolve(__dirname, "/src"),
      "@sifchain/sdk": path.resolve(__dirname, "../core"),
      stream: "stream-browserify",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/typography.scss";
       @import "@/scss/variables.scss";
       @import "@/scss/mixins.scss";`,
      },
    },
  },
});
