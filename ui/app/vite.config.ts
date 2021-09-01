import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgLoader from "./scripts/vite-svg-loader";

// import { visualizer } from 'rollup-plugin-visualizer'

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    sifchainPolyfillPlugin(),
    vueJsx(),
    vue(),
    (svgLoader as () => Plugin)(),
    viteSingleFile(),
  ].filter(Boolean),
  optimizeDeps: {
    include: ["buffer", "process"],
  },
  build: {
    brotliSize: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        // inlineDynamicImports: true,
        manualChunks: () => "everything.js",
      },
    },
  },
  server: {
    hmr: false,
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

// We have to add a few node polyfills to make Vite work.
// Vite's official stance is they DO NOT support modules that
// require node builtins as dependencies, but that doesn't really
// work for us because of all the crypto modules.
// So on the first js file compiled by vite, add a few globals...
function sifchainPolyfillPlugin() {
  let addedPolyfills = false;
  return {
    name: "sifchain-polyfill-plugin",
    transform(src, id) {
      if (!addedPolyfills && /\.m?js$/.test(id)) {
        addedPolyfills = true;
        return {
          code: [
            `import { Buffer as ___Buffer } from 'buffer'; window.Buffer = ___Buffer;`,
            `import * as ___process from 'process'; window.process = ___process;`,
            `window.global = window;`,
            src,
          ].join("\n"),
        };
      }
    },
  };
}
