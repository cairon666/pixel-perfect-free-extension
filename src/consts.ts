export const STORAGE_IMAGES_KEY = 'pixelPerfectImages';
export enum ActionsEnum {
  PING = 'ping',
  PONG = 'pong',
  SHOW_OVERLAY = 'showOverlay',
  HIDE_OVERLAY = 'hideOverlay',
  OPEN_IMAGE_PANEL = 'openImagePanel',
  TOGGLE_MAIN_MENU = 'toggleMainMenu',
  SUCCESS = 'success',
  UNKNOWN_ACTION = 'unknown_action',
}

/**
 * Константы для store - начальные значения атомов
 */
export const STORE_DEFAULTS = {
  // Overlay настройки
  OVERLAY_POSITION: { x: 50, y: 50 },
  OVERLAY_SCALE: 1,
  OVERLAY_OPACITY: 50,
  OVERLAY_SIZE: { width: 0, height: 0 },

  // Поведение
  OVERLAY_MOVE_STEP: 10, // пикселей за одно нажатие клавиши
  SCALE_STEP: 0.1, // шаг изменения масштаба
  OPACITY_STEP: 10, // шаг изменения прозрачности
} as const;

/**
 * Клавиши для горячих клавиш
 */
export const HOTKEYS = {
  TOGGLE_OPACITY: 'KeyQ',
  TOGGLE_LOCK: 'KeyL',
  TOGGLE_DIFF: 'KeyD',
  TOGGLE_CENTER: 'KeyC',
  MOVE_UP: 'ArrowUp',
  MOVE_DOWN: 'ArrowDown',
  MOVE_LEFT: 'ArrowLeft',
  MOVE_RIGHT: 'ArrowRight',
  HIDE_OVERLAY: 'Escape',
} as const;

export const MAX_SIZE_IMAGES = 20;
