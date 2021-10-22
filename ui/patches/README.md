# Patching readable-stream import in terra.js

@terra.js/terra-money relies on readable-stream module to load the Chrome extension. 
This module does not work with Vite. There is a vite compatible version, vite-compatible-readable-stream.

We cannot globally alias this in, however, because other modules in our application rely on stream,
which we already polyfill differently. Globally aliasing both polyfills breaks the application.

So we instead patch @terra.js/terra-money via patch-package to replace their readable-stream import with 
vite-compatible-readable-stream, leaving all other stream imports in the app alone.

We run the patch-package build as a "prebuild" script in the app's build step.
