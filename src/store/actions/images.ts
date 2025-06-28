import { action } from '@reatom/core';
import { UUID } from 'crypto';
import { compareDesc } from 'date-fns';
import { MAX_SIZE_IMAGES } from 'src/consts';

import { activeImageIdAtom, savedImagesAtom } from '../atoms';
import { Position, SavedImage, Size } from '../types';

/**
 * Actions для управления сохраненными изображениями
 */

export const createImageAction = action(
  (ctx, id: UUID, dataUrl: string, position: Position, size: Size) => {
    const images = ctx.get(savedImagesAtom);
    const imagesArray = Object.values(images).sort((a, b) => compareDesc(a.created, b.created));

    if (imagesArray.length === MAX_SIZE_IMAGES) {
      imagesArray.pop();
    }

    const newImage: SavedImage = {
      position,
      size,
      id,
      dataUrl,
      created: Date.now(),
    };
    imagesArray.push(newImage);

    const newImagesState = imagesArray.reduce(
      (acc, image) => {
        acc[image.id] = image;
        return acc;
      },
      {} as Record<UUID, SavedImage>
    );

    savedImagesAtom(ctx, newImagesState);
    activeImageIdAtom(ctx, id);
  },
  'createImageAction'
);

export const deleteImageAction = action((ctx, id: UUID) => {
  const images = ctx.get(savedImagesAtom);
  const activeImageId = ctx.get(activeImageIdAtom);

  const newImages = { ...images };
  delete newImages[id];

  savedImagesAtom(ctx, newImages);

  if (activeImageId === id) {
    activeImageIdAtom(ctx, id);
  }
}, 'deleteImageAction');

export const updateImagePositionAction = action((ctx, imageId: UUID, position: Position) => {
  const images = ctx.get(savedImagesAtom);

  const savedImage = images[imageId];
  const updatedImage = {
    ...savedImage,
    position,
  };

  savedImagesAtom(ctx, {
    ...images,
    [imageId]: updatedImage,
  });
}, 'updateImagePositionAction');

export const updateImageSizeAction = action((ctx, imageId: UUID, size: Size) => {
  const images = ctx.get(savedImagesAtom);

  const savedImage = images[imageId];
  const updatedImage = {
    ...savedImage,
    size,
  };

  savedImagesAtom(ctx, {
    ...images,
    [imageId]: updatedImage,
  });
}, 'updateImageSizeAction');
