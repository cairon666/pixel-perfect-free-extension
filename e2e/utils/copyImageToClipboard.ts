/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { readFileSync } from 'fs';
import path from 'path';
import { Page } from 'playwright/test';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Копирует тестовое изображение в буфер обмена
 * @param page - Playwright Page instance
 * @param imagePath - Путь к изображению относительно fixtures (по умолчанию 'test-image.png')
 */
export const copyImageToClipboard = async (page: Page, imagePath = 'test-image.png') => {
  // Читаем файл через Node.js
  const imagePathFull = path.join(__dirname, '../fixtures', imagePath);
  const imageBuffer = readFileSync(imagePathFull);
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  await page.evaluate(
    async ({ dataUrl, mimeType }: { dataUrl: string; mimeType: string }) => {
      // Конвертируем data URL в blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Копируем в буфер обмена
      await navigator.clipboard.write([
        new ClipboardItem({
          [mimeType]: blob,
        }),
      ]);
    },
    { dataUrl, mimeType }
  );
};
