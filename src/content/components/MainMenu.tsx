import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { STORAGE_IMAGES_KEY } from '../../consts';
import {
  FiClipboard,
  FiUpload,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { ControlButtons } from './ControlButtons';
import { ControlInputs } from './ControlInputs';
import { MenuButtons } from './MenuButtons';
import { Images } from './Images';
import { CloseButton } from './CloseButton';
import { DrugButton } from './DrugButton';
import { SavedImage } from 'src/store';

interface MainMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onToggleImagePanel: () => void;
  onToggleOpacity: () => void;
  onToggleLock: () => void;
  onToggleDiff: () => void;
  isImagePanelVisible: boolean;
  opacity: number;
  onOpacityChange: (value: number) => void;
  isLocked: boolean;
  isDiffMode: boolean;
  onMove?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onImageSelect: (
    dataUrl: string,
    imageId: string,
    position?: { x: number; y: number },
    size?: { width: number; height: number }
  ) => void;
  // Новые пропсы для координат и масштаба
  position?: { x: number; y: number };
  scale?: number;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onScaleChange?: (scale: number) => void;
  // Пропсы для режима центрирования
  isCentered?: boolean;
  onToggleCenter?: () => void;
}

export function MainMenu({
  isVisible,
  onClose,
  onToggleImagePanel,
  onToggleOpacity,
  onToggleLock,
  onToggleDiff,
  isImagePanelVisible,
  opacity,
  onOpacityChange,
  isLocked,
  isDiffMode,
  onMove,
  onImageSelect,
  position: imagePosition,
  scale,
  onPositionChange,
  onScaleChange,
  isCentered,
  onToggleCenter,
}: MainMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояние для сохраненных изображений
  const [images, setImages] = useState<SavedImage[]>([]);

  // Состояние для позиции меню
  const [menuPosition, setMenuPosition] = React.useState({
    x: Math.max(20, window.innerWidth - 440),
    y: 20,
  });

  // Hook для drag & drop
  const { isDragging, handleMouseDown } = useDragAndDrop({
    position: menuPosition,
    setPosition: setMenuPosition,
    disabled: false,
    containerRef: menuRef,
  });

  // Загружаем изображения при открытии панели
  useEffect(() => {
    if (isImagePanelVisible) {
      chrome.storage.local.get([STORAGE_IMAGES_KEY], result => {
        if (result[STORAGE_IMAGES_KEY]) {
          setImages(result[STORAGE_IMAGES_KEY] as SavedImage[]);
        }
      });
    }
  }, [isImagePanelVisible]);

  // Слушаем изменения в chrome.storage для обновления списка изображений
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_IMAGES_KEY] && changes[STORAGE_IMAGES_KEY].newValue) {
        setImages(changes[STORAGE_IMAGES_KEY].newValue as SavedImage[]);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const persistImages = (imgs: SavedImage[]) => {
    chrome.storage.local.set({ [STORAGE_IMAGES_KEY]: imgs });
  };

  const addImageToStorage = (dataUrl: string, name?: string) => {
    const newImg: SavedImage = {
      id: crypto.randomUUID(),
      dataUrl,
      created: Date.now(),
      name,
    };
    const updated = [newImg, ...images];
    // Ограничиваем до 20 изображений - удаляем самые старые (в конце массива)
    const limitedUpdated = updated.slice(0, 20);
    setImages(limitedUpdated);
    persistImages(limitedUpdated);
    return newImg;
  };

  const handlePaste = useCallback(() => {
    navigator.clipboard
      .read()
      .then(async items => {
        for (const item of items) {
          const imgType = item.types.find(t => t.startsWith('image/'));
          if (!imgType) continue;
          const blob = await item.getType(imgType);
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const newImg = addImageToStorage(dataUrl, 'Изображение из буфера');
            onImageSelect(newImg.dataUrl, newImg.id, { x: 0, y: 0 });
          };
          reader.readAsDataURL(blob);
          break;
        }
      })
      .catch(err => console.error('Failed to paste image', err));
  }, [images, onImageSelect]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newImg = addImageToStorage(dataUrl, file.name);
      onImageSelect(newImg.dataUrl, newImg.id, { x: 0, y: 0 });
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleSelect = (img: SavedImage) => {
    // Используем сохраненную позицию или { x: 0, y: 0 } для старых изображений без позиции
    onImageSelect(img.dataUrl, img.id, img.position || { x: 0, y: 0 }, img.size);
  };

  const handleDelete = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    persistImages(updated);
  };

  if (!isVisible) {
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
          'transition-none': isDragging,
          'transition-all duration-200': !isDragging,
        }
      )}
      style={{
        top: `${Math.max(0, menuPosition.y)}px`,
        left: `${Math.max(0, Math.min(menuPosition.x, window.innerWidth - 254))}px`,
        width: '254px',
        zIndex: 9999999, // Увеличиваем z-index чтобы всегда быть поверх изображения
        transform: isDragging ? 'translateZ(0)' : 'none',
        willChange: isDragging ? 'transform' : 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <DrugButton handleMouseDown={handleMouseDown} isDragging={isDragging} />
      <CloseButton onClose={onClose} />
      <MenuButtons
        onToggleImagePanel={onToggleImagePanel}
        isImagePanelVisible={isImagePanelVisible}
        onToggleOpacity={onToggleOpacity}
        opacity={opacity}
        onToggleLock={onToggleLock}
        isLocked={isLocked}
        onToggleDiff={onToggleDiff}
        isDiffMode={isDiffMode}
      />
      {isImagePanelVisible && (
        <div className='border-t border-gray-200 p-3 space-y-3 bg-gray-50'>
          {/* Контролы изображения - показываем только когда есть активное изображение */}
          {onOpacityChange && onMove && (
            <div className='space-y-3 pb-3 border-b border-gray-200'>
              {/* Блок позиционирования и координат */}
              <div className='flex items-start gap-3'>
                <ControlButtons
                  onMove={onMove}
                  isLocked={isLocked}
                  isCentered={isCentered}
                  onToggleCenter={onToggleCenter}
                />
                <ControlInputs
                  imagePosition={imagePosition}
                  onPositionChange={onPositionChange}
                  isLocked={isLocked}
                  isCentered={isCentered}
                  scale={scale}
                  onScaleChange={onScaleChange}
                />
              </div>

              {/* Слайдер прозрачности */}
              <div className='flex flex-col'>
                <div className='flex items-center gap-2 justify-between'>
                  <span className='text-xs font-medium text-gray-700 min-w-[70px]'>
                    Прозрачность:
                  </span>
                  <span className='text-xs text-gray-600 min-w-[25px]'>{opacity}%</span>
                </div>
                <div className='flex items-center gap-2 flex-1'>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={opacity}
                    onChange={e => onOpacityChange(Number(e.target.value))}
                    className='flex-1'
                    title={`Прозрачность: ${opacity}%`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Кнопки загрузки */}
          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={handlePaste}
              className='px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-2'
            >
              <FiClipboard size={16} />
              Вставить
            </button>
            <button
              onClick={handleFileUpload}
              className='px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors flex items-center gap-2'
            >
              <FiUpload size={16} />
              Загрузить
            </button>
          </div>
          <Images
            images={images}
            handleSelect={handleSelect}
            handleDelete={handleDelete}
          />
        </div>
      )}

      {/* Скрытый input для загрузки файлов */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  );
}
