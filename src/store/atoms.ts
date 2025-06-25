import { atom, action } from '@reatom/core';
import { Size, SavedImage, MoveDirection, Position } from './types';

// Основные атомы для overlay
export const imageSrcAtom = atom<string | null>(null, 'imageSrcAtom');
export const activeImageIdAtom = atom<string | null>(null, 'activeImageIdAtom'); // ID активного изображения
export const isVisibleAtom = atom(false, 'isVisibleAtom');
export const savedPositionAtom = atom<Position | undefined>(undefined, 'savedPositionAtom');
export const savedSizeAtom = atom<Size | undefined>(undefined, 'savedSizeAtom');

// Атомы для настроек overlay
export const opacityAtom = atom(50, 'opacityAtom');
export const isLockedAtom = atom(false, 'isLockedAtom');
export const isDiffModeAtom = atom(false, 'isDiffModeAtom');
export const isCenteredAtom = atom(false, 'isCenteredAtom');
export const overlayPositionAtom = atom<Position>({ x: 50, y: 50 }, 'overlayPositionAtom');
export const overlayScaleAtom = atom(1, 'overlayScaleAtom');

// Атомы для меню
export const isMainMenuVisibleAtom = atom(false, 'isMainMenuVisibleAtom');
export const isImagePanelVisibleAtom = atom(false, 'isImagePanelVisibleAtom');
export const menuPositionAtom = atom<Position>({ x: 20, y: 20 }, 'menuPositionAtom');

// Атом для сохраненных изображений
export const savedImagesAtom = atom<SavedImage[]>([], 'savedImagesAtom');

// Actions
export const setImageSrc = action((ctx, src: string | null) => {
  imageSrcAtom(ctx, src);
}, 'setImageSrc');

export const setActiveImageId = action((ctx, id: string | null) => {
  activeImageIdAtom(ctx, id);
}, 'setActiveImageId');

export const setVisible = action((ctx, visible: boolean) => {
  isVisibleAtom(ctx, visible);
}, 'setVisible');

export const setSavedPosition = action((ctx, position: Position | undefined) => {
  savedPositionAtom(ctx, position);
}, 'setSavedPosition');

export const setSavedSize = action((ctx, size: Size | undefined) => {
  savedSizeAtom(ctx, size);
}, 'setSavedSize');

export const setOpacity = action((ctx, opacity: number) => {
  opacityAtom(ctx, opacity);
}, 'setOpacity');

export const setLocked = action((ctx, locked: boolean) => {
  isLockedAtom(ctx, locked);
}, 'setLocked');

export const setDiffMode = action((ctx, diffMode: boolean) => {
  isDiffModeAtom(ctx, diffMode);
}, 'setDiffMode');

export const setCentered = action((ctx, centered: boolean) => {
  isCenteredAtom(ctx, centered);
}, 'setCentered');

export const setOverlayPosition = action((ctx, position: Position) => {
  overlayPositionAtom(ctx, position);
}, 'setOverlayPosition');

export const setOverlayScale = action((ctx, scale: number) => {
  overlayScaleAtom(ctx, scale);
  
  // При изменении масштаба в режиме центрирования пересчитываем позицию
  const isCentered = ctx.get(isCenteredAtom);
  if (isCentered) {
    // Отправляем событие для пересчета центрирования с новым масштабом
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('pixelPerfectMaintainCenter')
      );
    }, 0);
  }
}, 'setOverlayScale');

export const setMainMenuVisible = action((ctx, visible: boolean) => {
  isMainMenuVisibleAtom(ctx, visible);
}, 'setMainMenuVisible');

export const setImagePanelVisible = action((ctx, visible: boolean) => {
  isImagePanelVisibleAtom(ctx, visible);
}, 'setImagePanelVisible');

export const setMenuPosition = action((ctx, position: Position) => {
  menuPositionAtom(ctx, position);
}, 'setMenuPosition');

export const setSavedImages = action((ctx, images: SavedImage[]) => {
  savedImagesAtom(ctx, images);
}, 'setSavedImages');

// Обновление позиции и размера конкретного изображения
export const updateImageState = action((ctx, imageId: string, position: Position, size: Size) => {
  const images = ctx.get(savedImagesAtom);
  const updated = images.map(img => 
    img.id === imageId 
      ? { ...img, position, size }
      : img
  );
  savedImagesAtom(ctx, updated);
}, 'updateImageState');

// Комплексные действия
export const showOverlay = action((ctx, src: string, imageId: string, position?: Position, size?: Size) => {
  setSavedPosition(ctx, position);
  setSavedSize(ctx, size);
  setImageSrc(ctx, src);
  setActiveImageId(ctx, imageId);
  setVisible(ctx, true);
}, 'showOverlay');

export const hideOverlay = action(ctx => {
  setVisible(ctx, false);
  setImageSrc(ctx, null);
  setActiveImageId(ctx, null);
  setSavedPosition(ctx, undefined);
  setSavedSize(ctx, undefined);
}, 'hideOverlay');

export const closeMainMenu = action(ctx => {
  setMainMenuVisible(ctx, false);
  // Также скрываем изображение и панель если они открыты
  const isVisible = ctx.get(isVisibleAtom);
  if (isVisible) {
    hideOverlay(ctx);
  }
  setImagePanelVisible(ctx, false);
}, 'closeMainMenu');

export const toggleMainMenu = action(ctx => {
  const isVisible = ctx.get(isMainMenuVisibleAtom);
  if (isVisible) {
    closeMainMenu(ctx);
  } else {
    setMainMenuVisible(ctx, true);
  }
}, 'toggleMainMenu');

export const toggleImagePanel = action(ctx => {
  const current = ctx.get(isImagePanelVisibleAtom);
  setImagePanelVisible(ctx, !current);
}, 'toggleImagePanel');

export const toggleOpacity = action(ctx => {
  const current = ctx.get(opacityAtom);
  setOpacity(ctx, current === 0 ? 50 : 0);
}, 'toggleOpacity');

export const toggleLock = action(ctx => {
  const current = ctx.get(isLockedAtom);
  setLocked(ctx, !current);
}, 'toggleLock');

export const toggleDiff = action(ctx => {
  const current = ctx.get(isDiffModeAtom);
  setDiffMode(ctx, !current);
}, 'toggleDiff');

export const toggleCenter = action(ctx => {
  const current = ctx.get(isCenteredAtom);
  setCentered(ctx, !current);

  // При включении центрирования автоматически центрируем
  if (!current) {
    // Запускаем центрирование через событие (временно, пока не переделаем все)
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('pixelPerfectCenterImage', {
          detail: { shouldCenter: true },
        })
      );
    }, 0);
  }
}, 'toggleCenter');

export const moveOverlay = action((ctx, direction: MoveDirection) => {
  const isLocked = ctx.get(isLockedAtom);
  const isCentered = ctx.get(isCenteredAtom);

  if (isLocked) return;

  // В режиме центрирования игнорируем горизонтальные движения
  if (isCentered && (direction === 'left' || direction === 'right')) {
    return;
  }

  // Отправляем событие для перемещения изображения (временно)
  window.dispatchEvent(
    new CustomEvent('pixelPerfectMoveOverlay', {
      detail: { direction, isCentered },
    })
  );

  // При движении вверх/вниз в режиме центрирования поддерживаем центрирование
  if (isCentered && (direction === 'up' || direction === 'down')) {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('pixelPerfectMaintainCenter'));
    }, 0);
  }
}, 'moveOverlay');
