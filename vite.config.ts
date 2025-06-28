import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import path, { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, mergeConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';

// Plugin to copy manifest.json
const copyManifest = () => ({
  name: 'copy-manifest',
  writeBundle() {
    copyFileSync('manifest.json', 'dist/manifest.json');
  },
});

const baseConfig = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isMinify = env.VITE_MINIFY === 'true';
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;
  const preactAlias: Record<string, string> = isTest
    ? {}
    : {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      };

  return {
    build: {
      minify: isMinify,
      target: 'es2020',
      outDir: 'dist',
    },
    plugins: [
      react(),
      checker({
        typescript: {
          tsconfigPath: path.resolve(__dirname, 'tsconfig.web.json'),
        },
      }),
    ],
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
        ...preactAlias,
      },
    },
    define: {
      'process.env.NODE_ENV': isTest ? '"test"' : '"production"',
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
      },
      include: ['./src/**/*.{test,spec}.{tsx,ts}'],
    },
  };
});

export default defineConfig(env =>
  mergeConfig(
    baseConfig(env),
    defineConfig(() => {
      const isContentBuild = process.env.BUILD_TARGET === 'content';
      const isAnalyze = process.env.ANALYZE === 'true';
      const isAnalyzeOpen = process.env.ANALYZE_OPEN === 'true';

      return {
        plugins: [
          react(),
          isAnalyze &&
            visualizer({
              filename: isContentBuild
                ? 'dist/content-bundle-analysis.html'
                : 'dist/popup-bundle-analysis.html',
              open: isAnalyzeOpen,
              gzipSize: true,
            }),
          !isContentBuild && copyManifest(),
        ],
        build: {
          emptyOutDir: !isContentBuild,
          lib: isContentBuild
            ? {
                entry: resolve(__dirname, 'src/content.tsx'),
                name: 'PixelPerfectContent',
                fileName: () => 'src/content.js',
                formats: ['iife'],
              }
            : undefined,
          rollupOptions: isContentBuild
            ? {
                external: () => false,
                output: {
                  inlineDynamicImports: true,
                },
              }
            : {
                input: {
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
    })(env)
  )
);
