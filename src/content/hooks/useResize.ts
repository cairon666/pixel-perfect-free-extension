import { useState, useCallback, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeDirection = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

interface UseResizeProps {
  size: Size;
  setSize: (size: Size) => void;
  position: Position;
  setPosition: (position: Position) => void;
  disabled: boolean;
  imgRef: RefObject<HTMLImageElement>;
}

interface UseResizeReturn {
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
}

export const useResize = ({
  size,
  setSize,
  position,
  setPosition,
  disabled,
  imgRef,
}: UseResizeProps): UseResizeReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>('bottomRight');

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeStart({ x: e.clientX, y: e.clientY });
      setStartSize(size);
      setStartPosition(position);
      setResizeDirection(direction);
    },
    [disabled, size, position]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || disabled || !imgRef.current) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      // Calculate original image aspect ratio
      const aspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startPosition.x;
      let newY = startPosition.y;

      switch (resizeDirection) {
        case 'topLeft': {
          const scaleFromHeight = (startSize.height - deltaY) / startSize.height;
          const scaleFromWidth = (startSize.width - deltaX) / startSize.width;
          const scale = Math.max(0.1, Math.min(scaleFromHeight, scaleFromWidth));

          newHeight = Math.max(50, startSize.height * scale);
          newWidth = Math.max(50, newHeight * aspectRatio);
          newY = startPosition.y + (startSize.height - newHeight);
          newX = startPosition.x + (startSize.width - newWidth);
          break;
        }
        case 'topRight': {
          const scaleFromHeight = (startSize.height - deltaY) / startSize.height;
          const scaleFromWidth = (startSize.width + deltaX) / startSize.width;
          const scale = Math.max(0.1, Math.min(scaleFromHeight, scaleFromWidth));

          newHeight = Math.max(50, startSize.height * scale);
          newWidth = Math.max(50, newHeight * aspectRatio);
          newY = startPosition.y + (startSize.height - newHeight);
          // X position stays the same
          break;
        }
        case 'bottomRight': {
          const scaleFromHeight = (startSize.height + deltaY) / startSize.height;
          const scaleFromWidth = (startSize.width + deltaX) / startSize.width;
          const scale = Math.max(0.1, Math.min(scaleFromHeight, scaleFromWidth));

          newHeight = Math.max(50, startSize.height * scale);
          newWidth = Math.max(50, newHeight * aspectRatio);
          // Position stays the same
          break;
        }
        case 'bottomLeft': {
          const scaleFromHeight = (startSize.height + deltaY) / startSize.height;
          const scaleFromWidth = (startSize.width - deltaX) / startSize.width;
          const scale = Math.max(0.1, Math.min(scaleFromHeight, scaleFromWidth));

          newHeight = Math.max(50, startSize.height * scale);
          newWidth = Math.max(50, newHeight * aspectRatio);
          newX = startPosition.x + (startSize.width - newWidth);
          // Y position stays the same
          break;
        }
        default:
          break;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    },
    [
      isResizing,
      disabled,
      resizeStart,
      startSize,
      startPosition,
      resizeDirection,
      setSize,
      setPosition,
      imgRef,
    ]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
    return undefined;
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    isResizing,
    handleResizeStart,
  };
};
