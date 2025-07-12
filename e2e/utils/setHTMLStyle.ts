import { Page } from 'playwright/test';

export const setHTMLStyle = async (page: Page, style: Record<string, string>) => {
  return page.evaluate(styleProps => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      Object.entries(styleProps).forEach(([key, value]) => {
        if (value !== undefined) {
          (htmlElement.style as any)[key] = value;
        }
      });
    }
  }, style);
};

export const setHTMLFontSize = async (page: Page, size: string) =>
  setHTMLStyle(page, { fontSize: size });
