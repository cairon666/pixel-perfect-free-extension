import { useAtom } from '@reatom/npm-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { isImagePanelVisibleAtom, isMainMenuVisibleAtom, Position } from 'src/store';
import { useEventListener } from 'usehooks-ts';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { cn } from '../../lib/utils';
import { MENU_WIDTH, MENU_PADDING } from '../consts';
import { CloseButton } from './CloseButton';
import { DrugButton } from './DrugButton';
import { Images } from './Images';
import { MenuButtons } from './MenuButtons';
import { SettingsImage } from './SettingsImage';
import { UploadImages } from './UploadImages';

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    xRightSticky: false,
  });

  const [isImagePanelVisible] = useAtom(isImagePanelVisibleAtom);
  const [isMainMenuVisible] = useAtom(isMainMenuVisibleAtom);

  const handleDragMenu = (position: Position) => {
    const windowWidth = window.innerWidth;
    const xRightSticky = position.x + MENU_WIDTH + MENU_PADDING >= windowWidth;

    setMenuPosition({ x: position.x, y: position.y, xRightSticky });
  };

  const { isDragging, handleMouseDown, handleTouchStart } = useDragAndDrop({
    position: menuPosition,
    setPosition: handleDragMenu,
    disabled: false,
    containerRef: menuRef,
  });

  useLayoutEffect(() => {
    if (isMainMenuVisible) {
      const menuRects = menuRef.current?.getBoundingClientRect()!;
      setMenuPosition({
        x: window.innerWidth - menuRects.width - MENU_PADDING,
        y: 10,
        xRightSticky: true,
      });
    }
  }, [isMainMenuVisible]);

  useEventListener('resize', () => {
    if (!menuRef.current || !isMainMenuVisible || !menuPosition.xRightSticky) return;

    const windowWidth = window.innerWidth;
    setMenuPosition({
      x: windowWidth - MENU_WIDTH - MENU_PADDING,
      y: menuPosition.y,
      xRightSticky: true,
    });
  });

  if (!isMainMenuVisible) {
    return null;
  }

  return (
    <div
      data-testid='ppe-menu'
      ref={menuRef}
      className={cn(
        'inset-shadow-2xs fixed bg-white border-2 border-gray-300 rounded-lg shadow-2xl pointer-events-auto font-sans text-black',
        {
          'cursor-grabbing': isDragging,
        }
      )}
      style={{
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
        width: `${MENU_WIDTH}px`,
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
        <div
          data-testid='ppe-image-panel'
          className='border-t border-gray-200 p-3 space-y-3 bg-gray-50 rounded-b-lg'
        >
          <SettingsImage />
          <UploadImages />
          <Images />
        </div>
      )}
    </div>
  );
}
