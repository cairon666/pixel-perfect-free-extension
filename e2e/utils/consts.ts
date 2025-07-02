import { PageAssertionsToHaveScreenshotOptions } from 'playwright/test';

/**
 * Общие настройки для скриншотов в тестах
 * Помогают справиться с различиями в рендеринге между разными ОС
 */
export const defaultOptionsSreenshot: PageAssertionsToHaveScreenshotOptions = {
  threshold: 0.05, // Позволяем небольшие различия до 5%
  maxDiffPixels: 10000, // Максимум 10000 отличающихся пикселей
  animations: 'disabled' as const, // Отключаем анимации для стабильности
};
