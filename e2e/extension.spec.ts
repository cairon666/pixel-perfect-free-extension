import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPagePath = path.join(__dirname, 'fixtures', 'test-page.html');

test.describe('Pixel Perfect Extension', () => {
  test('should show menu when extension is activated', async ({ page }) => {
    // Переходим на локальную тестовую страницу
    await page.goto(`file://${testPagePath}`);

    // Ждем полной загрузки страницы
    await page.waitForLoadState('networkidle');

    // Даем время на инициализацию content script
    await page.waitForTimeout(2000);

    // Принудительно инжектируем content script если его нет
    const hasExtensionHost = await page.evaluate(() => {
      return !!document.getElementById('pixel-perfect-shadow-host');
    });

    if (!hasExtensionHost) {
      await page.addScriptTag({ path: './dist/src/content.js' });
      await page.waitForTimeout(3000);
    }

    // Проверяем, что расширение инициализировалось
    const extensionInitialized = await page.evaluate(() => {
      const shadowHost = document.getElementById('pixel-perfect-shadow-host');
      return !!shadowHost;
    });

    expect(extensionInitialized).toBe(true);

    // Активируем меню через глобальную функцию
    await page.evaluate(() => {
      if ((window as any).togglePixelPerfectMenu) {
        (window as any).togglePixelPerfectMenu();
      } else {
        // Fallback: используем событие
        document.dispatchEvent(new CustomEvent('pixelPerfectToggle'));
      }
    });

    await page.waitForTimeout(1000);

    // Проверяем наличие меню в shadow DOM
    const menuExists = await page.evaluate(() => {
      const shadowHost = document.getElementById('pixel-perfect-shadow-host');
      if (shadowHost && shadowHost.shadowRoot) {
        const menu = shadowHost.shadowRoot.querySelector('[data-testid="ppe-menu"]');
        return !!menu;
      }
      return false;
    });

    expect(menuExists).toBe(true);
  });
});
