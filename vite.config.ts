import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// Plugin to copy manifest.json
const copyManifest = () => ({
  name: 'copy-manifest',
  writeBundle() {
    copyFileSync('manifest.json', 'dist/manifest.json');
  },
});

// https://vitejs.dev/config/
export default defineConfig(() => {
  const isContentBuild = process.env.BUILD_TARGET === 'content';

  const isAnalyze = process.env.ANALYZE === 'true';
  const isMinify = process.env.MINIFY ? process.env.MINIFY === 'true' : true;

  if (isContentBuild) {
    // Build configuration for content script only
    return {
      plugins: [
        react(),
        isAnalyze &&
          visualizer({
            filename: 'dist/content-bundle-analysis.html',
            open: false,
            gzipSize: true,
          }),
      ],
      resolve: {
        alias: {
          src: resolve(__dirname, 'src'),
          // Use lightweight Preact for content script
          react: 'preact/compat',
          'react-dom': 'preact/compat',
        },
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env': '{}',
        global: 'globalThis',
      },
      build: {
        minify: isMinify,
        target: 'es2020',
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(__dirname, 'src/content.tsx'),
          name: 'PixelPerfectContent',
          fileName: () => 'src/content.js',
          formats: ['iife'],
        },
        rollupOptions: {
          external: () => false,
          output: {
            inlineDynamicImports: true,
          },
        },
      },
    };
  }

  // Default build configuration for popup and background
  return {
    plugins: [
      react(),
      copyManifest(),
      visualizer({
        filename: 'dist/popup-bundle-analysis.html',
        open: false,
        gzipSize: true,
      }),
    ],
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
        // Use Preact for popup too for maximum optimization
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, 'src/background.ts'),
        },
        output: {
          entryFileNames: chunkInfo => {
            if (chunkInfo.name === 'background') {
              return 'src/background.js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  };
});
