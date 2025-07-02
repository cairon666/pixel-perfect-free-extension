import { Page } from 'playwright/test';

/**
 * Ожидает загрузки шрифтов для стабильности скриншотов
 * @param page - Playwright Page instance
 */
export const waitForFonts = async (page: Page) => {
  await page.evaluate(async () => {
    // Ожидаем загрузки шрифтов через document.fonts API
    if ('fonts' in document) {
      await (document as any).fonts.ready;
    }

    // Дополнительная задержка для стабилизации рендеринга
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};
