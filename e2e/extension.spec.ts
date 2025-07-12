import { expect } from '@playwright/test';

import { test } from './fixtures/chrome-runtime-mock';
import { clickElementByTestId } from './utils/clickElementByTestId';
import { defaultOptionsSreenshot } from './utils/consts';
import { copyImageToClipboard } from './utils/copyImageToClipboard';
import { dragMenuToCenter, dragMenuToPosition } from './utils/dragMenu';
import { elementIsExists } from './utils/elementIsExists';
import { ElementsIds, toDataTesId } from './utils/ELEMENTS_IDS';
import { openMenu } from './utils/openMenu';
import { resizeViewportToDevice, VIEWPORT_SIZES } from './utils/resizeViewport';
import { setHTMLFontSize } from './utils/setHTMLStyle';
import { startExtension } from './utils/startExtension';
import { waitForFonts } from './utils/waitForFonts';

test('should show open menu when extension is activated', async ({ page, backgroundScript }) => {
  await startExtension(page);
  await openMenu(page, backgroundScript);

  await waitForFonts(page);
  await expect(page).toHaveScreenshot('image-panel-opened.png', defaultOptionsSreenshot);
});

test('should show open menu with settings', async ({ page, backgroundScript }) => {
  await startExtension(page);
  await openMenu(page, backgroundScript);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(false);

  await clickElementByTestId(page, ElementsIds.ToggleImagePanelButton);
  await page.waitForTimeout(500);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(true);

  await waitForFonts(page);
  await expect(page).toHaveScreenshot(
    'image-panel-opened-with-settings.png',
    defaultOptionsSreenshot
  );
});

test('should insert image from clipboard after opening image panel', async ({
  page,
  backgroundScript,
}) => {
  await startExtension(page);
  await openMenu(page, backgroundScript);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(false);

  await clickElementByTestId(page, ElementsIds.ToggleImagePanelButton);
  await page.waitForTimeout(500);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(true);

  // Добавляем тестовое изображение в буфер обмена
  await copyImageToClipboard(page, 'test-image.png');

  // Нажимаем кнопку вставки изображения из буфера обмена
  await clickElementByTestId(page, ElementsIds.InsertImageByCopyButton);
  await page.waitForTimeout(2000);

  // Проверяем, что изображение было добавлено в overlay
  expect(await elementIsExists(page, toDataTesId(ElementsIds.OverlayImage))).toBe(true);

  await waitForFonts(page);
  await expect(page).toHaveScreenshot('image-inserted-from-clipboard.png', defaultOptionsSreenshot);
});

test('should do not change if html size is change', async ({ page, backgroundScript }) => {
  await startExtension(page);
  await openMenu(page, backgroundScript);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(false);

  await clickElementByTestId(page, ElementsIds.ToggleImagePanelButton);
  await page.waitForTimeout(500);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(true);

  // Добавляем тестовое изображение в буфер обмена
  await copyImageToClipboard(page, 'test-image.png');

  // Нажимаем кнопку вставки изображения из буфера обмена
  await clickElementByTestId(page, ElementsIds.InsertImageByCopyButton);
  await page.waitForTimeout(2000);

  // Проверяем, что изображение было добавлено в overlay
  expect(await elementIsExists(page, toDataTesId(ElementsIds.OverlayImage))).toBe(true);

  await waitForFonts(page);
  await expect(page).toHaveScreenshot(
    'image-panel-settings-size-compare.png',
    defaultOptionsSreenshot
  );
  await setHTMLFontSize(page, '10px');
  await expect(page).toHaveScreenshot(
    'image-panel-settings-size-compare.png',
    defaultOptionsSreenshot
  );
});

test('should menu can be dragging', async ({ page, backgroundScript }) => {
  await startExtension(page);
  await openMenu(page, backgroundScript);

  await waitForFonts(page);
  await dragMenuToCenter(page);

  await expect(page).toHaveScreenshot('image-panel-is-dragging.png', defaultOptionsSreenshot);
});

test('should menu be sticky to right when viewport is resize', async ({
  page,
  backgroundScript,
}) => {
  await startExtension(page);
  await resizeViewportToDevice(page, 'DESKTOP_LARGE');
  await openMenu(page, backgroundScript);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(false);

  await clickElementByTestId(page, ElementsIds.ToggleImagePanelButton);
  await page.waitForTimeout(500);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(true);

  await waitForFonts(page);
  await expect(page).toHaveScreenshot(
    'image-menu-sticky-to-right-desktop-large.png',
    defaultOptionsSreenshot
  );

  await resizeViewportToDevice(page, 'DESKTOP_SMALL');
  await expect(page).toHaveScreenshot(
    'image-menu-sticky-to-right-desktop-small.png',
    defaultOptionsSreenshot
  );

  await resizeViewportToDevice(page, 'DESKTOP_LARGE');
  await expect(page).toHaveScreenshot(
    'image-menu-sticky-to-right-desktop-large.png',
    defaultOptionsSreenshot
  );
});

test('should menu be sticky to right when viewport is resize and menu non sticky', async ({
  page,
  backgroundScript,
}) => {
  await startExtension(page);
  await resizeViewportToDevice(page, 'DESKTOP_LARGE');
  await openMenu(page, backgroundScript);
  await dragMenuToPosition(
    page,
    VIEWPORT_SIZES.DESKTOP_SMALL.width,
    VIEWPORT_SIZES.DESKTOP_SMALL.height
  );

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(false);

  await clickElementByTestId(page, ElementsIds.ToggleImagePanelButton);
  await page.waitForTimeout(500);

  expect(await elementIsExists(page, toDataTesId(ElementsIds.ImagePanel))).toBe(true);

  await resizeViewportToDevice(page, 'DESKTOP_SMALL');
  await expect(page).toHaveScreenshot(
    'image-menu-sticky-to-right-menu-non-sticky-desktop-small.png',
    defaultOptionsSreenshot
  );

  await resizeViewportToDevice(page, 'DESKTOP_LARGE');
  await expect(page).toHaveScreenshot(
    'image-menu-sticky-to-right-menu-non-sticky-desktop-large.png',
    defaultOptionsSreenshot
  );
});
