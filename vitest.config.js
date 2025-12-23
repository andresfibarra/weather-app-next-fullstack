import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode || 'test', process.cwd(), '');

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      environmentMatchGlobs: [['**/*.integration.test.{js,jsx}', 'node']],
      setupFiles: ['./vitest.setup.js'],
      include: ['**/*.{test,spec}.{js,jsx}'],
      testTimeout: 10000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', '**/*.config.{js,mjs}', '**/__tests__/**', 'e2e/**'],
      },
      env,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
