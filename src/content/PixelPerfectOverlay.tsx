import React, { useState, useRef, useCallback } from 'react';

import { cn } from '../lib/utils';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useResize } from './hooks/useResize';
import { ResizeHandle } from './ResizeHandle';
import { Toolbar } from './Toolbar';

interface PixelPerfectOverlayProps {
  imageSrc: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function PixelPerfectOverlay({
  imageSrc,
  onClose,
  initialPosition,
  initialSize,
}: PixelPerfectOverlayProps) {
  const [opacity, setOpacity] = useState(50);
  const [isLocked, setIsLocked] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [diffType, setDiffType] = useState<'difference' | 'multiply' | 'overlay'>('difference');
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const [size, setSize] = useState(initialSize || { width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  // Функция для отправки обновлений состояния в popup
  const sendStateUpdate = useCallback(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime
        .sendMessage({
          action: 'updateImageState',
          src: imageSrc,
          position,
          size,
        })
        .catch(() => {
          // Ignore messaging errors
        });
    }
  }, [imageSrc, position, size]);

  // Обновляем состояние при изменении переданных пропсов
  React.useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
    if (initialSize && initialSize.width > 0 && initialSize.height > 0) {
      setSize(initialSize);
    }
  }, [initialPosition, initialSize]);

  // Отправляем обновления состояния при изменении позиции или размера
  React.useEffect(() => {
    // Пропускаем первое срабатывание (инициализация)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    // Отправляем обновления только если изображение загружено и имеет размеры
    if (imageLoaded && size.width > 0 && size.height > 0) {
      const timeoutId = setTimeout(sendStateUpdate, 500); // Дебаунс для уменьшения количества сообщений
      return () => clearTimeout(timeoutId);
    }
  }, [position, size, imageLoaded, sendStateUpdate]);

  // Custom hooks for drag and resize functionality
  const { isDragging, handleMouseDown: handleDragStart } = useDragAndDrop({
    position,
    setPosition,
    disabled: isLocked,
    containerRef,
  });

  const { handleResizeStart } = useResize({
    size,
    setSize,
    position,
    setPosition,
    disabled: isLocked,
    imgRef,
  });

  // Handle image load to set initial size
  const handleImageLoad = useCallback(() => {
    if (!imgRef.current) return;

    const img = imgRef.current;

    // Если размер уже установлен через пропсы, не пересчитываем
    if (initialSize && initialSize.width > 0 && initialSize.height > 0) {
      setImageLoaded(true);
      return;
    }

    const maxWidth = Math.min(window.innerWidth * 0.8, img.naturalWidth);
    const maxHeight = Math.min(window.innerHeight * 0.8, img.naturalHeight);

    let newWidth;
    let newHeight;

    if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
      newWidth = img.naturalWidth * ratio;
      newHeight = img.naturalHeight * ratio;
    } else {
      newWidth = img.naturalWidth;
      newHeight = img.naturalHeight;
    }

    setSize({ width: newWidth, height: newHeight });
    setImageLoaded(true);
  }, [initialSize]);

  // Move overlay with arrow keys
  const moveOverlay = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (isLocked) return;

      const step = 1;
      switch (direction) {
        case 'up':
          setPosition(prev => ({ ...prev, y: prev.y - step }));
          break;
        case 'down':
          setPosition(prev => ({ ...prev, y: prev.y + step }));
          break;
        case 'left':
          setPosition(prev => ({ ...prev, x: prev.x - step }));
          break;
        case 'right':
          setPosition(prev => ({ ...prev, x: prev.x + step }));
          break;
        default:
          break;
      }
    },
    [isLocked]
  );

  return (
    <div className='fixed inset-0 w-screen h-screen pointer-events-none z-[999999]'>
      <div
        ref={containerRef}
        className={cn(
          'absolute border-2 rounded pointer-events-auto select-none min-w-[50px] min-h-[50px]',
          {
            'border-red-500/50': isLocked,
            'border-blue-500/50': !isLocked,
            'cursor-default': isLocked,
            'cursor-grabbing': !isLocked && isDragging,
            'cursor-move': !isLocked && !isDragging,
            'border-purple-500': isDiffMode,
          }
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          opacity: opacity / 100,
          mixBlendMode: isDiffMode ? diffType : 'normal',
          backgroundColor: isDiffMode ? 'rgba(255,255,255,0.1)' : 'transparent',
        }}
        role='dialog'
        aria-label='Pixel Perfect Overlay'
        onMouseDown={handleDragStart}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          className='block w-full h-full object-contain pointer-events-none select-none'
          style={{
            mixBlendMode: isDiffMode ? 'difference' : 'normal',
            filter: isDiffMode ? 'invert(1) hue-rotate(180deg)' : 'none',
            backgroundColor: isDiffMode ? 'white' : 'transparent',
          }}
          onLoad={handleImageLoad}
          alt='Pixel Perfect Overlay'
        />

        {/* Resize handles */}
        {!isLocked && imageLoaded && (
          <>
            <ResizeHandle position='topLeft' onMouseDown={e => handleResizeStart(e, 'topLeft')} />
            <ResizeHandle position='topRight' onMouseDown={e => handleResizeStart(e, 'topRight')} />
            <ResizeHandle
              position='bottomRight'
              onMouseDown={e => handleResizeStart(e, 'bottomRight')}
            />
            <ResizeHandle
              position='bottomLeft'
              onMouseDown={e => handleResizeStart(e, 'bottomLeft')}
            />
          </>
        )}
      </div>

      <Toolbar
        opacity={opacity}
        onOpacityChange={setOpacity}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        isDiffMode={isDiffMode}
        onToggleDiff={() => {
          const newDiffMode = !isDiffMode;
          setIsDiffMode(newDiffMode);

          // Переключаем тип эффекта для тестирования
          if (newDiffMode) {
            let nextType: 'difference' | 'multiply' | 'overlay';
            if (diffType === 'difference') {
              nextType = 'multiply';
            } else if (diffType === 'multiply') {
              nextType = 'overlay';
            } else {
              nextType = 'difference';
            }
            setDiffType(nextType);
          }
        }}
        onClose={onClose}
        onMove={moveOverlay}
      />
    </div>
  );
}
