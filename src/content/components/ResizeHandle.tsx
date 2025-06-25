import React, { useState } from 'react';

import { cn } from '../../lib/utils';

type ResizePosition = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

interface ResizeHandleProps {
  position: ResizePosition;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPositionClasses = (pos: ResizePosition): string => {
    switch (pos) {
      case 'topLeft':
        return '-left-1.5 -top-1.5';
      case 'topRight':
        return '-right-1.5 -top-1.5';
      case 'bottomRight':
        return '-right-1.5 -bottom-1.5';
      case 'bottomLeft':
        return '-left-1.5 -bottom-1.5';
      default:
        return '-left-1.5 -top-1.5';
    }
  };

  const getCursorClass = (pos: ResizePosition): string => {
    switch (pos) {
      case 'topLeft':
        return 'cursor-nw-resize';
      case 'topRight':
        return 'cursor-ne-resize';
      case 'bottomRight':
        return 'cursor-se-resize';
      case 'bottomLeft':
        return 'cursor-sw-resize';
      default:
        return 'cursor-nw-resize';
    }
  };

  return (
    <div
      className={cn(
        'absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full pointer-events-auto transition-all duration-200 ease-in-out shadow-lg',
        getPositionClasses(position),
        getCursorClass(position),
        {
          'opacity-100 scale-125': isHovered,
          'opacity-80 scale-100': !isHovered,
        }
      )}
      role='button'
      tabIndex={0}
      aria-label={`Resize handle ${position}`}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
