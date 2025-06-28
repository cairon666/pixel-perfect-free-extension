import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, 'dist');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Отключаем для расширений
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Один worker для расширений
  reporter: 'html',

  use: {
    baseURL: 'https://example.com',
    trace: 'on-first-retry',
    // Увеличиваем таймауты для расширений
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },

  projects: [
    {
      name: 'extension-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Важно: используем channel: 'chrome' для лучшей совместимости с расширениями
        channel: 'chrome',
        // Запуск Chrome с загруженным расширением
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            // Условные флаги для CI/локальной разработки
            ...(process.env.CI
              ? [
                  '--no-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-features=VizDisplayCompositor',
                ]
              : [
                  // Для локальной разработки - более безопасные настройки
                  '--disable-web-security', // Только для тестов
                ]),
            '--allow-running-insecure-content',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
          ],
          headless: true, // Расширения не работают в headless режиме
        },
        contextOptions: {
          // Разрешения для расширения
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
  ],
});
