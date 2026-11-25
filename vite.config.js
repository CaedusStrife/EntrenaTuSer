import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssCodeSplit: true,
    // Bundle all dependencies for self-contained PWA (offline support)
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('leaflet')) return 'vendor-leaflet';
            if (id.includes('chart.js')) return 'vendor-chart';
            if (id.includes('lucide')) return 'vendor-lucide';
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    visualizer({
      filename: 'bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': '/js',
    },
  },
});