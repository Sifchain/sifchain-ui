// We have to add a few node polyfills to make Vite work.
// Vite's official stance is they DO NOT support modules that
// require node builtins as dependencies, but that doesn't really
// work for us because of all the crypto modules.
// So on the first js file compiled by vite, add a few globals...
export function vitePolyfills() {
  let addedPolyfills = false;
  return {
    name: "vite-polyfills",
    transform(src: string, id: string) {
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
