import { atom } from '@reatom/core';

/**
 * Атомы для управления состоянием пользовательского интерфейса
 */

// Видимость главного меню
export const isMainMenuVisibleAtom = atom(false, 'isMainMenuVisibleAtom');

// Видимость панели с изображениями
export const isImagePanelVisibleAtom = atom(false, 'isImagePanelVisibleAtom');
