import { useState, useCallback, useEffect, RefObject } from 'react';
import { Position, Size } from 'src/store';

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
  handleTouchResizeStart: (e: React.TouchEvent, direction: ResizeDirection) => void;
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

  const startResize = useCallback(
    (clientX: number, clientY: number, direction: ResizeDirection) => {
      if (disabled) return;

      setIsResizing(true);
      setResizeStart({ x: clientX, y: clientY });
      setStartSize(size);
      setStartPosition(position);
      setResizeDirection(direction);
    },
    [disabled, size, position]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();
      startResize(e.clientX, e.clientY, direction);
    },
    [startResize]
  );

  const handleTouchResizeStart = useCallback(
    (e: React.TouchEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      if (touch) {
        startResize(touch.clientX, touch.clientY, direction);
      }
    },
    [startResize]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isResizing || disabled || !imgRef.current) return;

      const deltaX = clientX - resizeStart.x;
      const deltaY = clientY - resizeStart.y;

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

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    },
    [handleMove]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      // Mouse события
      document.addEventListener('mousemove', handleResizeMove, { capture: true });
      document.addEventListener('mouseup', handleResizeEnd, { passive: true });

      // Touch события
      document.addEventListener('touchmove', handleTouchMove, { capture: true });
      document.addEventListener('touchend', handleResizeEnd, { passive: true });
      document.addEventListener('touchcancel', handleResizeEnd, { passive: true });

      // Предотвращаем выделение и скролл
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';

      return () => {
        // Убираем mouse события
        document.removeEventListener('mousemove', handleResizeMove, { capture: true });
        document.removeEventListener('mouseup', handleResizeEnd);

        // Убираем touch события
        document.removeEventListener('touchmove', handleTouchMove, { capture: true });
        document.removeEventListener('touchend', handleResizeEnd);
        document.removeEventListener('touchcancel', handleResizeEnd);

        // Восстанавливаем стили
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
      };
    }
    return undefined;
  }, [isResizing, handleResizeMove, handleTouchMove, handleResizeEnd]);

  return {
    isResizing,
    handleResizeStart,
    handleTouchResizeStart,
  };
};
