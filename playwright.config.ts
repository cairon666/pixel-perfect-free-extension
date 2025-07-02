import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Отключаем для расширений
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Один worker для расширений
  reporter: process.env.CI ? [['html'], ['github']] : 'html',

  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    // Увеличиваем таймауты для расширений
    actionTimeout: 10000,
    navigationTimeout: 10000,
    // Настройки скриншотов
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Настройки для Docker
    ...(process.env.CI && {
      // В CI/Docker используем headless режим
      headless: true,
      // Отключаем анимации для стабильности
      reducedMotion: 'reduce',
    }),
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  projects: [
    {
      name: 'extension-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
