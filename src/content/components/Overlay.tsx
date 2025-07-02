/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useAction, useAtom } from '@reatom/npm-react';
import React, { useRef } from 'react';
import { STORE_DEFAULTS } from 'src/consts';
import {
  opacityAtom,
  isLockedAtom,
  isDiffModeAtom,
  isCenteredAtom,
  setPositionAction,
  currentImageAtom,
  setSizeAction,
  isMainMenuVisibleAtom,
} from 'src/store';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useResize } from '../../hooks/useResize';
import { cn } from '../../lib/utils';
import { ResizeHandle } from './ResizeHandle';

export function Overlay() {
  const [opacity] = useAtom(opacityAtom);
  const [isLocked] = useAtom(isLockedAtom);
  const [isDiffMode] = useAtom(isDiffModeAtom);
  const [isCentered] = useAtom(isCenteredAtom);
  const [currentImage] = useAtom(currentImageAtom);
  const [isMainMenuVisible] = useAtom(isMainMenuVisibleAtom);

  const setPosition = useAction(setPositionAction);
  const setSize = useAction(setSizeAction);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    handleMouseDown: handleDragStart,
    handleTouchStart: handleTouchDragStart,
  } = useDragAndDrop({
    position: currentImage?.position || STORE_DEFAULTS.OVERLAY_POSITION,
    setPosition,
    disabled: isLocked,
    containerRef,
    isCentered,
  });

  const { handleResizeStart, handleTouchResizeStart } = useResize({
    size: currentImage?.size || STORE_DEFAULTS.OVERLAY_SIZE,
    setSize,
    position: currentImage?.position || STORE_DEFAULTS.OVERLAY_POSITION,
    setPosition,
    disabled: isLocked,
    imgRef,
  });

  if (!currentImage || !isMainMenuVisible) {
    return null;
  }

  return (
    <div
      data-testid='ppe-image-overlay'
      className='fixed inset-0 w-screen h-screen pointer-events-none z-[999999]'
    >
      <div
        ref={containerRef}
        className={cn(
          'absolute border-2 rounded pointer-events-auto select-none min-w-[50px] min-h-[50px] touch-none',
          {
            'border-red-500/50': isLocked,
            'border-blue-500/50': !isLocked,
            'cursor-default': isLocked,
            'cursor-grabbing': !isLocked && isDragging,
            'cursor-move': !isLocked && !isDragging,
          }
        )}
        style={{
          left: isCentered ? '50%' : `${currentImage.position?.x}px`,
          top: `${currentImage.position.y}px`,
          width: `${currentImage.size.width}px`,
          height: `${currentImage.size.height}px`,
          opacity: opacity / 100,
          transform: isCentered ? 'translate(-50%, 0)' : 'none',
          transformOrigin: 'center center',
        }}
        role='dialog'
        aria-label='Pixel Perfect Overlay'
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchDragStart}
      >
        <img
          ref={imgRef}
          src={currentImage.dataUrl}
          className='block w-full h-full object-contain pointer-events-none select-none'
          style={{
            mixBlendMode: isDiffMode ? 'difference' : 'normal',
            filter: isDiffMode ? 'invert(1) hue-rotate(180deg)' : 'none',
            backgroundColor: isDiffMode ? 'white' : 'transparent',
          }}
          alt='Pixel Perfect Overlay'
        />

        {/* Resize handles */}
        {!isLocked && (
          <>
            <ResizeHandle
              position='topLeft'
              onMouseDown={e => handleResizeStart(e, 'topLeft')}
              onTouchStart={e => handleTouchResizeStart(e, 'topLeft')}
            />
            <ResizeHandle
              position='topRight'
              onMouseDown={e => handleResizeStart(e, 'topRight')}
              onTouchStart={e => handleTouchResizeStart(e, 'topRight')}
            />
            <ResizeHandle
              position='bottomRight'
              onMouseDown={e => handleResizeStart(e, 'bottomRight')}
              onTouchStart={e => handleTouchResizeStart(e, 'bottomRight')}
            />
            <ResizeHandle
              position='bottomLeft'
              onMouseDown={e => handleResizeStart(e, 'bottomLeft')}
              onTouchStart={e => handleTouchResizeStart(e, 'bottomLeft')}
            />
          </>
        )}
      </div>
    </div>
  );
}
