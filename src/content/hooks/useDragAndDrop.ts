import { useState, useCallback, useEffect, RefObject, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndDropProps {
  position: Position;
  setPosition: (position: Position) => void;
  disabled: boolean;
  containerRef: RefObject<HTMLDivElement>;
  isCentered?: boolean;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

// Throttle функция для оптимизации
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const useDragAndDrop = ({
  position,
  setPosition,
  disabled,
  containerRef,
  isCentered,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  // Используем useRef для хранения актуальных значений
  const dragDataRef = useRef({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !containerRef.current) return;

      // Don't start drag if clicking on resize handles
      const target = e.target as HTMLElement;
      if (target.style.cursor?.includes('resize')) return;

      e.preventDefault();
      e.stopPropagation();
      
      const newDragStart = { x: e.clientX, y: e.clientY };
      
      setIsDragging(true);
      setDragStart(newDragStart);
      setStartPosition(position);
      
      // Обновляем ref для использования в throttled функции
      dragDataRef.current = {
        isDragging: true,
        dragStart: newDragStart,
        startPosition: position,
      };
    },
    [disabled, position, containerRef]
  );

  // Throttled mousemove handler для плавности
  const throttledMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (!dragDataRef.current.isDragging || disabled) return;

      const deltaX = e.clientX - dragDataRef.current.dragStart.x;
      const deltaY = e.clientY - dragDataRef.current.dragStart.y;

      // В режиме центрирования блокируем изменение X
      let newX = dragDataRef.current.startPosition.x;
      if (!isCentered) {
        // Ограничиваем положение в пределах viewport
        newX = Math.max(0, Math.min(window.innerWidth - 320, dragDataRef.current.startPosition.x + deltaX));
      }
      
      const newY = Math.max(0, Math.min(window.innerHeight - 200, dragDataRef.current.startPosition.y + deltaY));

      setPosition({
        x: newX,
        y: newY,
      });
    }, 16), // ~60fps
    [disabled, setPosition, isCentered]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragDataRef.current.isDragging = false;
  }, []);

  useEffect(() => {
    if (isDragging) {
      // Используем passive listeners для лучшей производительности
      document.addEventListener('mousemove', throttledMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });
      
      // Предотвращаем выделение текста во время перетаскивания
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      
      // Восстанавливаем pointer-events для нашего контейнера
      if (containerRef.current) {
        containerRef.current.style.pointerEvents = 'auto';
      }

      return () => {
        document.removeEventListener('mousemove', throttledMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
      };
    }
    return undefined;
  }, [isDragging, throttledMouseMove, handleMouseUp, containerRef]);

  return {
    isDragging,
    handleMouseDown,
  };
};
