import { action } from '@reatom/core';

import { isMainMenuVisibleAtom, isImagePanelVisibleAtom } from '../atoms';

/**
 * Actions для управления пользовательским интерфейсом
 */

// Базовые setters
export const setMainMenuVisibleAction = action((ctx, visible: boolean) => {
  isMainMenuVisibleAtom(ctx, visible);
}, 'setMainMenuVisible');

export const setImagePanelVisibleAction = action((ctx, visible: boolean) => {
  isImagePanelVisibleAtom(ctx, visible);
}, 'setImagePanelVisible');

// Комплексные actions
export const closeMainMenuAction = action(ctx => {
  setMainMenuVisibleAction(ctx, false);
  setImagePanelVisibleAction(ctx, false);
}, 'closeMainMenu');

export const toggleMainMenuAction = action(ctx => {
  const isVisible = ctx.get(isMainMenuVisibleAtom);
  if (isVisible) {
    closeMainMenuAction(ctx);
  } else {
    setMainMenuVisibleAction(ctx, true);
  }
}, 'toggleMainMenu');

export const toggleImagePanelAction = action(ctx => {
  const current = ctx.get(isImagePanelVisibleAtom);
  setImagePanelVisibleAction(ctx, !current);
}, 'toggleImagePanel');
