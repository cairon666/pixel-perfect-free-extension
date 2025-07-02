import path from 'path';
import { expect, Page } from 'playwright/test';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPagePath = path.join(__dirname, '..', 'fixtures', 'test-page.html');

export const startExtension = async (page: Page) => {
  // Переходим на локальную тестовую страницу
  await page.goto(`file://${testPagePath}`);

  // Ждем полной загрузки страницы
  await page.waitForLoadState('networkidle');

  // Даем время на инициализацию content script
  await page.waitForTimeout(2000);

  // Проверяем есть ли shadow host
  const hasExtensionHost = await page.evaluate(() => {
    return !!document.getElementById('pixel-perfect-shadow-host');
  });

  // Если его нет, принудительно инжектируем
  if (!hasExtensionHost) {
    await page.addScriptTag({ path: './dist/src/content.js' });
    await page.waitForTimeout(3000);

    // Теперь ждем появления элемента
    await page.waitForSelector('#pixel-perfect-shadow-host', {
      state: 'attached',
      timeout: 5000,
    });
  }

  // Проверяем, что расширение инициализировалось
  const extensionInitialized = await page.evaluate(() => {
    const shadowHost = document.getElementById('pixel-perfect-shadow-host');
    return !!shadowHost;
  });

  expect(extensionInitialized).toBe(true);
};
