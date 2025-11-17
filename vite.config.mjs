import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    sourcemapIgnoreList: false,
    fs: {
      strict: false,
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
      'web-worker': 'elkjs/lib/elk-api.js',
    },
  },
});
