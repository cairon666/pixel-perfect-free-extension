import { action } from '@reatom/core';
import { UUID } from 'crypto';

import { activeImageIdAtom } from '../atoms';
import { Position, Size } from '../types';
import { updateImagePositionAction, updateImageSizeAction } from './images';

/**
 * Actions для управления overlay
 */

export const setActiveImageIdAction = action((ctx, id: UUID | null) => {
  activeImageIdAtom(ctx, id);
}, 'setActiveImageId');

export const setPositionAction = action((ctx, position: Position) => {
  const imageId = ctx.get(activeImageIdAtom);
  if (!imageId) return;

  updateImagePositionAction(ctx, imageId, position);
}, 'setPosition');

export const setSizeAction = action((ctx, size: Size) => {
  const imageId = ctx.get(activeImageIdAtom);
  if (!imageId) return;

  updateImageSizeAction(ctx, imageId, size);
}, 'setSize');

export const hideOverlayAction = action(ctx => {
  activeImageIdAtom(ctx, null);
}, 'hideOverlay');

export const showOverlayAction = action((ctx, id: UUID) => {
  activeImageIdAtom(ctx, id);
}, 'showOverlay');
