import { useState, useCallback, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndDropProps {
  position: Position;
  setPosition: (position: Position) => void;
  disabled: boolean;
  containerRef: RefObject<HTMLDivElement>;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const useDragAndDrop = ({
  position,
  setPosition,
  disabled,
  containerRef,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !containerRef.current) return;

      // Don't start drag if clicking on resize handles
      const target = e.target as HTMLElement;
      if (target.style.cursor?.includes('resize')) return;

      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPosition(position);
    },
    [disabled, position, containerRef]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPosition({
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY,
      });
    },
    [isDragging, disabled, dragStart, startPosition, setPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    handleMouseDown,
  };
};
