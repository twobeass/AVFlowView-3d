import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['d3', 'd3-hwschematic', 'elkjs'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      // Polyfill web-worker for browser context
      'web-worker': 'elkjs/lib/elk-api.js',
    },
  },
  server: {
    fs: {
      // Allow serving files from node_modules
      strict: false,
    },
  },
});
