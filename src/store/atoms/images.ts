import { atom } from '@reatom/core';
import { UUID } from 'crypto';
import { createChromeStorageAtom } from 'src/lib/createChromeStorageAtom';

import { SavedImage } from '../types';

/**
 * Атомы для управления сохраненными изображениями
 */

// Массив сохраненных изображений
export const { atom: savedImagesAtom, initFromStorage: initSavedImages } = createChromeStorageAtom<
  Record<UUID, SavedImage>
>('savedImagesAtom', {});

// ID активного изображения из сохраненных
export const activeImageIdAtom = atom<UUID | null>(null, 'activeImageIdAtom');

export const currentImageAtom = atom(ctx => {
  const currentID = ctx.spy(activeImageIdAtom);
  if (!currentID) {
    return null;
  }

  const savedImages = ctx.spy(savedImagesAtom);
  return savedImages[currentID];
});

// Текущее отображаемое изображение
export const imageSrcAtom = atom(ctx => ctx.spy(currentImageAtom)?.dataUrl || null, 'imageSrcAtom');

// Текущая позиция overlay на экране
export const positionAtom = atom(
  ctx => ctx.spy(currentImageAtom)?.position || null,
  'positionAtom'
);

// Текущий масштаб overlay
export const sizeAtom = atom(ctx => ctx.spy(currentImageAtom)?.size || null, 'sizeAtom');
