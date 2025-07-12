import { PageAssertionsToHaveScreenshotOptions } from 'playwright/test';

/**
 * Общие настройки для скриншотов в тестах
 * Помогают справиться с различиями в рендеринге между разными ОС
 */
export const defaultOptionsSreenshot: PageAssertionsToHaveScreenshotOptions = {
  animations: 'disabled' as const, // Отключаем анимации для стабильности
};
