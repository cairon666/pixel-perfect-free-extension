import React, { useState, useRef, useCallback } from 'react';

import { cn } from '../../lib/utils';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useResize } from '../hooks/useResize';
import { ResizeHandle } from './ResizeHandle';

interface PixelPerfectOverlayProps {
  imageSrc: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  opacity: number;
  onOpacityChange: (value: number) => void;
  isLocked: boolean;
  isDiffMode: boolean;
  isCentered?: boolean;
  position?: { x: number; y: number };
  scale?: number;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onScaleChange?: (scale: number) => void;
  onImageStateUpdate?: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
}

export function PixelPerfectOverlay({
  imageSrc,
  onClose,
  initialPosition,
  initialSize,
  opacity,
  onOpacityChange,
  isLocked,
  isDiffMode,
  isCentered,
  position: externalPosition,
  scale: externalScale,
  onPositionChange,
  onScaleChange,
  onImageStateUpdate,
}: PixelPerfectOverlayProps) {

  const [diffType, setDiffType] = useState<'difference' | 'multiply' | 'overlay'>('difference');
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [size, setSize] = useState(initialSize || { width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const isInternalUpdateRef = useRef(false); // Флаг для отслеживания внутренних обновлений

  // Функция для отправки обновлений состояния через обработчик
  const sendStateUpdate = useCallback(() => {
    if (onImageStateUpdate && size.width > 0 && size.height > 0) {
      onImageStateUpdate(position, size);
    }
  }, [onImageStateUpdate, position, size]);

  // Обновляем состояние при изменении переданных пропсов
  React.useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    } else {
      // Если начальная позиция не задана, используем { x: 0, y: 0 }
      setPosition({ x: 0, y: 0 });
    }
    if (initialSize && initialSize.width > 0 && initialSize.height > 0) {
      setSize(initialSize);
    }
  }, [initialPosition, initialSize]);

  // Только отправляем обновления позиции во внешний компонент (без обратной синхронизации)
  React.useEffect(() => {
    if (onPositionChange && imageLoaded) {
      // Устанавливаем флаг внутреннего обновления перед отправкой
      isInternalUpdateRef.current = true;
      onPositionChange(position);
    }
  }, [position, onPositionChange, imageLoaded]);

  // Отправляем обновления состояния при изменении позиции или размера
  React.useEffect(() => {
    // Пропускаем первое срабатывание (инициализация)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    // Отправляем обновления сразу когда изображение загружено и имеет размеры
    if (imageLoaded && size.width > 0 && size.height > 0) {
      sendStateUpdate();
    }
  }, [position, size, imageLoaded, sendStateUpdate]);



  // Custom hooks for drag and resize functionality
  const { isDragging, handleMouseDown: handleDragStart } = useDragAndDrop({
    position,
    setPosition,
    disabled: isLocked,
    containerRef,
    isCentered,
  });

  // Применяем изменения позиции из внешних инпутов только когда не перетаскиваем
  React.useEffect(() => {
    if (externalPosition && !isDragging && !isInternalUpdateRef.current) {
      // Проверяем с толерантностью ±2 пикселя для избежания циклических обновлений
      const tolerance = 2;
      const isSignificantlyDifferent = 
        Math.abs(externalPosition.x - position.x) > tolerance ||
        Math.abs(externalPosition.y - position.y) > tolerance;
      
      if (isSignificantlyDifferent) {
        setPosition(externalPosition);
      }
    }
    // Сбрасываем флаг после проверки
    isInternalUpdateRef.current = false;
  }, [externalPosition?.x, externalPosition?.y, isDragging, position.x, position.y]);

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

  // Слушаем события перемещения от MainMenu
  React.useEffect(() => {
    const handleMoveOverlay = (event: CustomEvent) => {
      const { direction, isCentered } = event.detail;
      
      // В режиме центрирования блокируем горизонтальные движения
      if (isCentered && (direction === 'left' || direction === 'right')) {
        return;
      }
      
      moveOverlay(direction);
      
      // При движении в режиме центрирования поддерживаем центрирование по X
      if (isCentered && (direction === 'up' || direction === 'down')) {
        const centerX = Math.round((window.innerWidth - size.width) / 2);
        setPosition(prev => ({ ...prev, x: centerX }));
      }
    };

    const handleCenterImage = (event: CustomEvent) => {
      const { shouldCenter } = event.detail;
      if (shouldCenter) {
        // Центрируем изображение: середина изображения = середина экрана
        // При transform: scale() с transform-origin: center, элемент масштабируется от своего центра
        // Поэтому для центрирования нужно позиционировать центр элемента по центру экрана
        const centerX = Math.round((window.innerWidth - size.width) / 2);
        setPosition(prev => ({ ...prev, x: centerX }));
      }
    };

    const handleMaintainCenter = () => {
      if (isCentered) {
        // Поддерживаем центрирование: середина изображения = середина экрана
        // При transform: scale() с transform-origin: center, достаточно позиционировать центр элемента
        const centerX = Math.round((window.innerWidth - size.width) / 2);
        setPosition(prev => ({ ...prev, x: centerX }));
      }
    };

    window.addEventListener('pixelPerfectMoveOverlay', handleMoveOverlay as EventListener);
    window.addEventListener('pixelPerfectCenterImage', handleCenterImage as EventListener);
    window.addEventListener('pixelPerfectMaintainCenter', handleMaintainCenter as EventListener);

    return () => {
      window.removeEventListener('pixelPerfectMoveOverlay', handleMoveOverlay as EventListener);
      window.removeEventListener('pixelPerfectCenterImage', handleCenterImage as EventListener);
      window.removeEventListener('pixelPerfectMaintainCenter', handleMaintainCenter as EventListener);
    };
      }, [moveOverlay, size.width, isCentered, isLocked]);

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
          transform: externalScale ? `scale(${externalScale})` : 'none',
          transformOrigin: 'center center',
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
    </div>
  );
}
