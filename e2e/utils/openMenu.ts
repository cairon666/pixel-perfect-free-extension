import { expect, Page } from 'playwright/test';

import { elementIsExists } from './elementIsExists';
import { ElementsIds, toDataTesId } from './ELEMENTS_IDS';

export const openMenu = async (page: Page, backgroundScript: any) => {
  expect(await elementIsExists(page, toDataTesId(ElementsIds.Menu))).toBe(false);

  // Получаем ID текущей вкладки через background script
  const tabId = await backgroundScript.evaluate(async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0]?.id;
  });

  // Отправляем сообщение через background script
  await backgroundScript.evaluate((tabId: number) => {
    chrome.tabs.sendMessage(tabId, { action: 'toggleMainMenu' });
  }, tabId);

  await page.waitForTimeout(1000);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.Menu))).toBe(true);
};
