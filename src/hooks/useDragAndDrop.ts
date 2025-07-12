import { noop } from 'lodash-es';
import { useState, useCallback, useEffect, RefObject, useRef } from 'react';
import { Position } from 'src/store';

interface UseDragAndDropProps {
  position: Position;
  setPosition: (position: Position) => void;
  disabled: boolean;
  containerRef: RefObject<HTMLDivElement>;
  isCentered?: boolean;
  allowOutsideViewport?: boolean;
}

export const useDragAndDrop = ({
  position,
  setPosition,
  disabled,
  containerRef,
  isCentered,
  allowOutsideViewport = false, // По умолчанию false для обратной совместимости
}: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const dragDataRef = useRef({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
  });

  const startDrag = useCallback(
    (clientX: number, clientY: number, target: HTMLElement) => {
      if (disabled || !containerRef.current) return false;

      // Don't start drag if clicking on resize handles
      if (target.style.cursor?.includes('resize')) return false;

      const newDragStart = { x: clientX, y: clientY };
      setIsDragging(true);

      // Обновляем ref для использования в функции движения
      dragDataRef.current = {
        isDragging: true,
        dragStart: newDragStart,
        startPosition: position,
      };

      return true;
    },
    [disabled, position, containerRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      startDrag(e.clientX, e.clientY, target);
    },
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      startDrag(touch.clientX, touch.clientY, target);
    },
    [startDrag]
  );

  // Универсальная функция движения для mouse и touch
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragDataRef.current.isDragging || disabled) return;

      const deltaX = clientX - dragDataRef.current.dragStart.x;
      const deltaY = clientY - dragDataRef.current.dragStart.y;

      // В режиме центрирования блокируем изменение X
      let newX = dragDataRef.current.startPosition.x;
      if (!isCentered) {
        if (allowOutsideViewport) {
          // Разрешаем свободное перемещение без ограничений
          newX = dragDataRef.current.startPosition.x + deltaX;
        } else {
          // Получаем актуальные размеры элемента
          const containerElement = containerRef.current;
          if (containerElement) {
            const containerWidth = containerElement.offsetWidth;

            // Получаем актуальные размеры viewport с учетом DevTools
            const viewportWidth = window.visualViewport?.width || window.innerWidth;

            // Ограничиваем положение в пределах viewport
            const minX = 0;
            const maxX = Math.max(0, viewportWidth - containerWidth);
            newX = Math.max(minX, Math.min(maxX, dragDataRef.current.startPosition.x + deltaX));
          } else {
            newX = dragDataRef.current.startPosition.x + deltaX;
          }
        }
      }

      // Обрабатываем Y координату
      let newY;
      if (allowOutsideViewport) {
        // Разрешаем свободное перемещение по Y без ограничений
        newY = dragDataRef.current.startPosition.y + deltaY;
      } else {
        // Получаем актуальные размеры элемента
        const containerElement = containerRef.current;
        if (containerElement) {
          const containerHeight = containerElement.offsetHeight;
          const viewportHeight = window.visualViewport?.height || window.innerHeight;

          // Ограничиваем по Y с учетом актуального viewport
          const minY = 0;
          const maxY = Math.max(0, viewportHeight - containerHeight);
          newY = Math.max(minY, Math.min(maxY, dragDataRef.current.startPosition.y + deltaY));
        } else {
          newY = dragDataRef.current.startPosition.y + deltaY;
        }
      }

      setPosition({
        x: newX,
        y: newY,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, isCentered, setPosition, allowOutsideViewport]
  );

  // Mouse events
  const mouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragDataRef.current.isDragging = false;
  }, []);

  // Touch events
  const touchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    dragDataRef.current.isDragging = false;
  }, []);

  // Эффект для обработки изменения размеров viewport
  useEffect(() => {
    if (allowOutsideViewport) return noop; // Не применяем ограничения если разрешен выход за пределы

    const handleViewportChange = () => {
      // При изменении viewport проверяем, не вышел ли элемент за границы
      const containerElement = containerRef.current;
      if (!containerElement) return;

      const containerWidth = containerElement.offsetWidth;
      const containerHeight = containerElement.offsetHeight;
      const viewportWidth = window.visualViewport?.width || window.innerWidth;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      const currentPosition = position;
      let needsUpdate = false;
      let newX = currentPosition.x;
      let newY = currentPosition.y;

      // Проверяем границы и корректируем позицию если нужно
      if (!isCentered) {
        const maxX = Math.max(0, viewportWidth - containerWidth);
        if (currentPosition.x > maxX) {
          newX = maxX;
          needsUpdate = true;
        }
      }

      const maxY = Math.max(0, viewportHeight - containerHeight);
      if (currentPosition.y > maxY) {
        newY = maxY;
        needsUpdate = true;
      }

      if (needsUpdate) {
        setPosition({ x: newX, y: newY });
      }
    };

    // Слушаем изменения viewport (полезно для responsive режима)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [position, setPosition, isCentered, containerRef, allowOutsideViewport]);

  useEffect(() => {
    if (isDragging) {
      // Добавляем слушатели для mouse событий
      document.addEventListener('mousemove', mouseMove, { capture: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });

      // Добавляем слушатели для touch событий
      document.addEventListener('touchmove', touchMove, { capture: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      // Предотвращаем выделение текста во время перетаскивания
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      // Отключаем touch action для предотвращения скролла на мобильных
      document.body.style.touchAction = 'none';

      // Восстанавливаем pointer-events для нашего контейнера
      if (containerRef.current) {
        containerRef.current.style.pointerEvents = 'auto';
      }

      return () => {
        // Убираем mouse события
        document.removeEventListener('mousemove', mouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp);

        // Убираем touch события
        document.removeEventListener('touchmove', touchMove, { capture: true });
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);

        // Восстанавливаем стили
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
        document.body.style.touchAction = '';
      };
    }
    return undefined;
  }, [isDragging, mouseMove, handleMouseUp, touchMove, handleTouchEnd, containerRef]);

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
};
