import { Page } from 'playwright/test';

export interface DragPosition {
  x: number;
  y: number;
}

export interface DragOptions {
  /** Задержка в миллисекундах перед началом drag операции */
  delay?: number;
  /** Нужно ли ждать после завершения операции */
  waitAfter?: number;
  /** Количество промежуточных шагов для более плавного перемещения */
  steps?: number;
}

/**
 * Получает элемент drag button из shadow DOM
 */
const getDragButtonPosition = async (page: Page): Promise<{ x: number; y: number }> => {
  return page.evaluate(() => {
    const shadowHost = document.getElementById('pixel-perfect-shadow-host');
    if (!shadowHost) {
      throw new Error('Shadow host не найден');
    }
    if (!shadowHost.shadowRoot) {
      throw new Error('Shadow root не найден');
    }

    const dragButton = shadowHost.shadowRoot.querySelector(
      '[data-testid="ppe-drag-button"]'
    ) as HTMLElement;
    if (!dragButton) {
      throw new Error('Drag button не найден');
    }

    const rect = dragButton.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  });
};

/**
 * Перемещает меню с помощью drag and drop операции
 */
export const dragMenuToPosition = async (
  page: Page,
  targetX: number,
  targetY: number,
  options: DragOptions = {}
): Promise<void> => {
  const { delay = 100, waitAfter = 300, steps = 10 } = options;

  if (delay > 0) {
    await page.waitForTimeout(delay);
  }

  // Получаем позицию drag button
  const startPosition = await getDragButtonPosition(page);

  // Выполняем drag and drop используя Playwright API
  await page.mouse.move(startPosition.x, startPosition.y);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps });
  await page.mouse.up();

  if (waitAfter > 0) {
    await page.waitForTimeout(waitAfter);
  }
};

/**
 * Перемещает меню с помощью drag and drop операции используя объект позиции
 */
export const dragMenuToPositionObject = async (
  page: Page,
  position: DragPosition,
  options: DragOptions = {}
): Promise<void> => {
  await dragMenuToPosition(page, position.x, position.y, options);
};

/**
 * Перемещает меню в центр экрана
 */
export const dragMenuToCenter = async (page: Page, options: DragOptions = {}): Promise<void> => {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Viewport размер не определен');
  }

  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  await dragMenuToPosition(page, centerX, centerY, options);
};

/**
 * Предустановленные позиции для быстрого перемещения меню
 */
export const MENU_POSITIONS = {
  TOP_LEFT: { x: 100, y: 100 },
  TOP_RIGHT: { x: -100, y: 100 }, // Отрицательные значения означают отступ от правого края
  BOTTOM_LEFT: { x: 100, y: -100 },
  BOTTOM_RIGHT: { x: -100, y: -100 },
  CENTER: { x: 0, y: 0 }, // Специальное значение для центра
} as const;

/**
 * Перемещает меню в предустановленную позицию
 */
export const dragMenuToPresetPosition = async (
  page: Page,
  position: keyof typeof MENU_POSITIONS,
  options: DragOptions = {}
): Promise<void> => {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Viewport размер не определен');
  }

  const preset = MENU_POSITIONS[position];

  if (position === 'CENTER') {
    await dragMenuToCenter(page, options);
    return;
  }

  const targetX = preset.x < 0 ? viewport.width + preset.x : preset.x;
  const targetY = preset.y < 0 ? viewport.height + preset.y : preset.y;

  await dragMenuToPosition(page, targetX, targetY, options);
};
