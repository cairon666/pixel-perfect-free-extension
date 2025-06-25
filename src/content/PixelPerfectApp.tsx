import React, { useEffect, useCallback } from 'react';
import { useAtom, useAction } from '@reatom/npm-react';

import { PixelPerfectOverlay } from './components/PixelPerfectOverlay';
import { MainMenu } from './components/MainMenu';
import { 
  imageSrcAtom, 
  activeImageIdAtom,
  isVisibleAtom, 
  savedPositionAtom, 
  savedSizeAtom,
  isMainMenuVisibleAtom,
  isImagePanelVisibleAtom,
  opacityAtom,
  isLockedAtom,
  isDiffModeAtom,
  isCenteredAtom,
  overlayPositionAtom,
  overlayScaleAtom,
  showOverlay,
  hideOverlay,
  closeMainMenu,
  toggleMainMenu,
  toggleImagePanel,
  toggleOpacity,
  toggleLock,
  toggleDiff,
  toggleCenter,
  moveOverlay,
  setOpacity,
  setOverlayPosition,
  setOverlayScale,
  updateImageState,
  MoveDirection
} from '../store';

export function PixelPerfectApp() {
  // Используем Reatom атомы вместо useState
  const [imageSrc] = useAtom(imageSrcAtom);
  const [activeImageId] = useAtom(activeImageIdAtom);
  const [isVisible] = useAtom(isVisibleAtom);
  const [savedPosition] = useAtom(savedPositionAtom);
  const [savedSize] = useAtom(savedSizeAtom);
  const [isImagePanelVisible] = useAtom(isImagePanelVisibleAtom);
  const [isMainMenuVisible] = useAtom(isMainMenuVisibleAtom);
  
  // Состояние для overlay параметров
  const [opacity] = useAtom(opacityAtom);
  const [isLocked] = useAtom(isLockedAtom);
  const [isDiffMode] = useAtom(isDiffModeAtom);
  const [isCentered] = useAtom(isCenteredAtom);
  const [overlayPosition] = useAtom(overlayPositionAtom);
  const [overlayScale] = useAtom(overlayScaleAtom);
  
  // Используем Reatom actions
  const showOverlayAction = useAction(showOverlay);
  const hideOverlayAction = useAction(hideOverlay);
  const closeMainMenuAction = useAction(closeMainMenu);
  const toggleMainMenuAction = useAction(toggleMainMenu);
  const toggleImagePanelAction = useAction(toggleImagePanel);
  const toggleOpacityAction = useAction(toggleOpacity);
  const toggleLockAction = useAction(toggleLock);
  const toggleDiffAction = useAction(toggleDiff);
  const toggleCenterAction = useAction(toggleCenter);
  const moveOverlayAction = useAction(moveOverlay);
  const setOpacityAction = useAction(setOpacity);
  const setOverlayPositionAction = useAction(setOverlayPosition);
  const setOverlayScaleAction = useAction(setOverlayScale);
  const updateImageStateAction = useAction(updateImageState);

  // Удаляем старые обработчики событий, так как теперь используется Reatom



  // Handle overlay close
  const handleClose = useCallback(() => {
    closeMainMenuAction();
  }, [closeMainMenuAction]);

  // Handle main menu close  
  const handleMainMenuClose = useCallback(() => {
    closeMainMenuAction();
  }, [closeMainMenuAction]);

  // Handle image panel toggle
  const handleToggleImagePanel = useCallback(() => {
    toggleImagePanelAction();
  }, [toggleImagePanelAction]);



  // Handle image selection from panel
  const handleImageSelect = useCallback((dataUrl: string, imageId: string, position?: { x: number; y: number }, size?: { width: number; height: number }) => {
    showOverlayAction(dataUrl, imageId, position, size);
  }, [showOverlayAction]);

  // Handle overlay parameter changes
  const handleToggleOpacity = useCallback(() => {
    toggleOpacityAction();
  }, [toggleOpacityAction]);

  const handleToggleLock = useCallback(() => {
    toggleLockAction();
  }, [toggleLockAction]);

  const handleToggleDiff = useCallback(() => {
    toggleDiffAction();
  }, [toggleDiffAction]);

  const handleToggleCenter = useCallback(() => {
    toggleCenterAction();
  }, [toggleCenterAction]);

  const handlePositionChange = useCallback((newPosition: { x: number; y: number }) => {
    setOverlayPositionAction(newPosition);
  }, [setOverlayPositionAction]);

  const handleScaleChange = useCallback((newScale: number) => {
    setOverlayScaleAction(newScale);
  }, [setOverlayScaleAction]);

  // Handle move overlay
  const handleMoveOverlay = useCallback((direction: MoveDirection) => {
    moveOverlayAction(direction);
  }, [moveOverlayAction]);

  // Handle image state update for persistence
  const handleImageStateUpdate = useCallback((position: { x: number; y: number }, size: { width: number; height: number }) => {
    if (activeImageId && position && size) {
      updateImageStateAction(activeImageId, position, size);
      
      // Также сохраняем в chrome.storage для совместимости с popup
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'updateImageState',
          imageId: activeImageId,
          position,
          size,
        }).catch(() => {
          // Ignore messaging errors
        });
      }
    }
  }, [updateImageStateAction, activeImageId]);

  return (
    <>
      <MainMenu
        isVisible={isMainMenuVisible}
        onClose={handleMainMenuClose}
        onToggleImagePanel={handleToggleImagePanel}
        onToggleOpacity={handleToggleOpacity}
        onToggleLock={handleToggleLock}
        onToggleDiff={handleToggleDiff}
        isImagePanelVisible={isImagePanelVisible}
        opacity={opacity}
        onOpacityChange={(value: number) => setOpacityAction(value)}
        isLocked={isLocked}
        isDiffMode={isDiffMode}
        isCentered={isCentered}
        onToggleCenter={handleToggleCenter}
        onMove={isVisible ? handleMoveOverlay : undefined}
        onImageSelect={handleImageSelect}
        position={isVisible ? overlayPosition : undefined}
        scale={isVisible ? overlayScale : undefined}
        onPositionChange={isVisible ? handlePositionChange : undefined}
        onScaleChange={isVisible ? handleScaleChange : undefined}
      />

      {isVisible && imageSrc && (
        <PixelPerfectOverlay
          imageSrc={imageSrc}
          onClose={handleClose}
          initialPosition={savedPosition}
          initialSize={savedSize}
          opacity={opacity}
          onOpacityChange={(value: number) => setOpacityAction(value)}
          isLocked={isLocked}
          isDiffMode={isDiffMode}
          isCentered={isCentered}
          position={overlayPosition}
          scale={overlayScale}
          onPositionChange={handlePositionChange}
          onScaleChange={handleScaleChange}
          onImageStateUpdate={handleImageStateUpdate}
        />
      )}
    </>
  );
}
