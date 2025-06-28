import { action } from '@reatom/core';

import { STORE_DEFAULTS } from '../../consts';
import { opacityAtom, isLockedAtom, isDiffModeAtom, isCenteredAtom, positionAtom } from '../atoms';
import { MoveDirection } from '../types';
import { setPositionAction } from './overlay';

/**
 * Actions для управления настройками overlay
 */

// Базовые setters
export const setOpacityAction = action((ctx, opacity: number) => {
  opacityAtom(ctx, opacity);
}, 'setOpacity');

export const setLockedAction = action((ctx, locked: boolean) => {
  isLockedAtom(ctx, locked);
}, 'setLocked');

export const setDiffModeAction = action((ctx, diffMode: boolean) => {
  isDiffModeAtom(ctx, diffMode);
}, 'setDiffMode');

export const setCenteredAction = action((ctx, centered: boolean) => {
  isCenteredAtom(ctx, centered);
}, 'setCentered');

// Toggle actions
export const toggleOpacityAction = action(ctx => {
  const current = ctx.get(opacityAtom);
  setOpacityAction(ctx, current === 0 ? STORE_DEFAULTS.OVERLAY_OPACITY : 0);
}, 'toggleOpacity');

export const toggleLockAction = action(ctx => {
  const current = ctx.get(isLockedAtom);
  setLockedAction(ctx, !current);
}, 'toggleLock');

export const toggleDiffAction = action(ctx => {
  const current = ctx.get(isDiffModeAtom);
  setDiffModeAction(ctx, !current);
}, 'toggleDiff');

export const toggleCenterAction = action(ctx => {
  const current = ctx.get(isCenteredAtom);
  setCenteredAction(ctx, !current);
}, 'toggleCenter');

// Перемещение overlay с учетом настроек
export const moveOverlayAction = action((ctx, direction: MoveDirection) => {
  const isCentered = ctx.get(isCenteredAtom);
  const position = ctx.get(positionAtom);
  const isLocked = ctx.get(isLockedAtom);

  if (isLocked || !position) return;

  // В режиме центрирования блокируем горизонтальные движения
  if (isCentered && (direction === 'left' || direction === 'right')) {
    return;
  }

  const step = 1;
  switch (direction) {
    case 'up':
      setPositionAction(ctx, { ...position, y: position.y - step });
      break;
    case 'down':
      setPositionAction(ctx, { ...position, y: position.y + step });
      break;
    case 'left':
      setPositionAction(ctx, { ...position, x: position.x - step });
      break;
    case 'right':
      setPositionAction(ctx, { ...position, x: position.x + step });
      break;
    default:
      break;
  }
}, 'moveOverlay');
