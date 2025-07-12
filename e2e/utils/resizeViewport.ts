import { Page } from 'playwright/test';

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Изменяет размер viewport для тестирования на разных размерах экрана
 */
export const resizeViewport = async (page: Page, width: number, height: number): Promise<void> => {
  await page.setViewportSize({ width, height });
};

/**
 * Изменяет размер viewport используя объект с размерами
 */
export const resizeViewportWithSize = async (page: Page, size: ViewportSize): Promise<void> => {
  await page.setViewportSize(size);
};

/**
 * Предустановленные размеры viewport для популярных устройств
 */
export const VIEWPORT_SIZES = {
  MOBILE: { width: 375, height: 667 }, // iPhone SE
  TABLET: { width: 768, height: 1024 }, // iPad
  DESKTOP: { width: 1920, height: 1080 }, // Full HD
  DESKTOP_SMALL: { width: 1366, height: 768 }, // Популярный размер ноутбука
  DESKTOP_LARGE: { width: 2560, height: 1440 }, // 2K экран
} as const;

/**
 * Изменяет размер viewport на предустановленный размер устройства
 */
export const resizeViewportToDevice = async (
  page: Page,
  device: keyof typeof VIEWPORT_SIZES
): Promise<void> => {
  const size = VIEWPORT_SIZES[device];
  await page.setViewportSize(size);
};
