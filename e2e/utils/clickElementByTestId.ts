import { Page } from 'playwright/test';

export const clickElementByTestId = async (page: Page, testId: string) => {
  await page.evaluate((testId: string) => {
    const shadowHost = document.getElementById('pixel-perfect-shadow-host');
    if (!shadowHost) {
      throw new Error('Shadow host не найден');
    }
    if (!shadowHost.shadowRoot) {
      throw new Error('Shadow root не найден');
    }

    const element = shadowHost.shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
    if (!element) {
      // Выводим все доступные элементы для отладки
      const allElements = Array.from(shadowHost.shadowRoot.querySelectorAll('*[data-testid]'))
        .map(el => el.getAttribute('data-testid'))
        .filter(Boolean);
      throw new Error(
        `Элемент с data-testid="${testId}" не найден. Доступные data-testid: ${allElements.join(', ')}`
      );
    }

    element.click();
  }, testId);
};
