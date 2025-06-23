import React, { useState, useEffect, useCallback } from 'react';

import { PixelPerfectOverlay } from './PixelPerfectOverlay';

export function PixelPerfectApp() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [savedPosition, setSavedPosition] = useState<{ x: number; y: number } | undefined>();
  const [savedSize, setSavedSize] = useState<{ width: number; height: number } | undefined>();

  // Handle paste events for image upload
  const handlePasteEvent = useCallback(async (event: ClipboardEvent) => {
    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    Array.from(clipboardItems).some(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) return false;
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        setIsVisible(true);
        event.preventDefault();
        return true;
      }
      return false;
    });
  }, []);

  // Handle events from global message handler
  useEffect(() => {
    const handleShowOverlay = (event: CustomEvent) => {
      const { src, position, size } = event.detail;

      if (src) {
        // Сначала устанавливаем сохранённые позицию и размер
        setSavedPosition(position);
        setSavedSize(size);

        // Затем показываем overlay с уже установленными значениями
        setImageSrc(src);
        setIsVisible(true);
      }
    };

    const handleHideOverlay = () => {
      setIsVisible(false);
      setImageSrc(null);
      setSavedPosition(undefined);
      setSavedSize(undefined);
    };

    window.addEventListener('pixelPerfectShowOverlay', handleShowOverlay as EventListener);
    window.addEventListener('pixelPerfectHideOverlay', handleHideOverlay);

    return () => {
      window.removeEventListener('pixelPerfectShowOverlay', handleShowOverlay as EventListener);
      window.removeEventListener('pixelPerfectHideOverlay', handleHideOverlay);
    };
  }, []);

  // Add paste event listener
  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent, true);

    return () => {
      window.removeEventListener('paste', handlePasteEvent, true);
    };
  }, [handlePasteEvent]);

  // Handle overlay close
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setImageSrc(null);
    setSavedPosition(undefined);
    setSavedSize(undefined);
  }, []);

  if (!isVisible || !imageSrc) {
    return null;
  }

  return (
    <PixelPerfectOverlay
      imageSrc={imageSrc}
      onClose={handleClose}
      initialPosition={savedPosition}
      initialSize={savedSize}
    />
  );
}
