import { useAtom } from '@reatom/npm-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { isImagePanelVisibleAtom, isMainMenuVisibleAtom } from 'src/store';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { cn } from '../../lib/utils';
import { CloseButton } from './CloseButton';
import { DrugButton } from './DrugButton';
import { Images } from './Images';
import { MenuButtons } from './MenuButtons';
import { SettingsImage } from './SettingsImage';
import { UploadImages } from './UploadImages';

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [isImagePanelVisible] = useAtom(isImagePanelVisibleAtom);
  const [isMainMenuVisible] = useAtom(isMainMenuVisibleAtom);

  const { isDragging, handleMouseDown, handleTouchStart } = useDragAndDrop({
    position: menuPosition,
    setPosition: setMenuPosition,
    disabled: false,
    containerRef: menuRef,
  });

  useLayoutEffect(() => {
    if (isMainMenuVisible) {
      const menuRects = menuRef.current?.getBoundingClientRect()!;
      setMenuPosition({ x: window.innerWidth - menuRects.width - 20, y: 10 });
    }
  }, [isMainMenuVisible]);

  if (!isMainMenuVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed bg-white border-2 border-gray-300 rounded-lg shadow-2xl pointer-events-auto font-sans',
        'backdrop-blur-sm',
        {
          'cursor-grabbing': isDragging,
        }
      )}
      style={{
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
        width: '254px',
        zIndex: 9999999,
        transform: isDragging ? 'translateZ(0)' : 'none',
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      <DrugButton
        handleMouseDown={handleMouseDown}
        handleTouchStart={handleTouchStart}
        isDragging={isDragging}
      />
      <CloseButton />
      <MenuButtons />
      {isImagePanelVisible && (
        <div className='border-t border-gray-200 p-3 space-y-3 bg-gray-50'>
          <SettingsImage />
          <UploadImages />
          <Images />
        </div>
      )}
    </div>
  );
}
