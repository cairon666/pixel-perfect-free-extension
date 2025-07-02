import { Page } from 'playwright/test';

export const elementIsExists = (page: Page, selector: string) => {
  return page.evaluate(selector => {
    const shadowHost = document.getElementById('pixel-perfect-shadow-host');
    if (shadowHost && shadowHost.shadowRoot) {
      const menu = shadowHost.shadowRoot.querySelector(selector);
      return !!menu;
    }
    return false;
  }, selector);
};
