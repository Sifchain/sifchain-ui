import { vitePolyfills } from '../app/scripts/vite-polyfills'
import reactRefresh from '@vitejs/plugin-react-refresh'
import path from 'path'

// https://vitejs.dev/config/
export default {
  plugins: [vitePolyfills(), reactRefresh()],
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src'),
      '@sifchain/sdk': path.resolve(__dirname, '../core'),
      stream: 'stream-browserify',
    },
  },
}
