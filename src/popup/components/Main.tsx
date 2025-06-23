import {
  ClipboardIcon,
  ImageIcon,
  TrashIcon,
  EyeOpenIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import React, { useEffect, useState, useCallback, useRef } from 'react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { ActionsEnum, STORAGE_IMAGES_KEY } from '../../consts';
import { useOnStorageChange } from '../../hooks/useOnStorageChange';
import { logError } from '../../lib/logger';

interface SavedImage {
  id: string;
  dataUrl: string;
  created: number;
  name?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export function Main() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images on mount
  useEffect(() => {
    chrome.storage.local.get([STORAGE_IMAGES_KEY], result => {
      if (result[STORAGE_IMAGES_KEY]) {
        setImages(result[STORAGE_IMAGES_KEY] as SavedImage[]);
      }
    });
  }, []);

  // Слушаем изменения в chrome.storage для обновления состояния
  useOnStorageChange(changes => {
    if (changes[STORAGE_IMAGES_KEY]) {
      const newImages = changes[STORAGE_IMAGES_KEY].newValue;
      if (newImages) {
        setImages(newImages as SavedImage[]);
      }
    }
  });

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
    setImages(updated);
    persistImages(updated);
    return newImg;
  };

  const showOverlay = (
    src: string,
    position?: { x: number; y: number },
    size?: { width: number; height: number }
  ) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        return;
      }

      chrome.tabs.get(tabId, async () => {
        // Функция для внедрения content script и отправки сообщения
        const ensureContentScriptAndSend = async () => {
          try {
            // Сначала попробуем ping
            await chrome.tabs.sendMessage(tabId, { action: ActionsEnum.PING });
          } catch (error) {
            try {
              // Внедряем content script
              await chrome.scripting.executeScript({
                target: { tabId },
                files: ['src/content.js'],
              });
              // Ждём немного для инициализации
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (injectError) {
              logError('Failed to inject content script', injectError);
              throw injectError;
            }
          }

          // Отправляем сообщение
          await chrome.tabs.sendMessage(tabId, {
            action: ActionsEnum.SHOW_OVERLAY,
            src,
            position,
            size,
          });
        };

        ensureContentScriptAndSend().catch(error => logError('Failed to show overlay', error));
      });
    });
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
            showOverlay(newImg.dataUrl);
          };
          reader.readAsDataURL(blob);
          break;
        }
      })
      .catch(err => logError('Failed to paste image', err));
  }, [images]);

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
      showOverlay(newImg.dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleSelect = (img: SavedImage) => {
    showOverlay(img.dataUrl, img.position, img.size);
  };

  const handleDelete = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    persistImages(updated);
  };

  return (
    <Card className='border-none w-[300px]'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <EyeOpenIcon className='h-5 w-5' />
          Пиксель Перфект
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Upload buttons */}
        <div className='grid grid-cols-2 gap-2'>
          <Button onClick={handlePaste} size='sm' variant='outline'>
            <ClipboardIcon className='h-4 w-4 mr-2' />
            Вставить
          </Button>
          <Button onClick={handleFileUpload} size='sm' variant='outline'>
            <UploadIcon className='h-4 w-4 mr-2' />
            Загрузить
          </Button>
        </div>

        <Separator />

        {/* Saved images */}
        <div className='space-y-3'>
          <h3 className='text-sm font-medium flex items-center gap-2'>
            <ImageIcon className='h-4 w-4' />
            Сохранённые изображения ({images.length})
          </h3>

          {images.length === 0 ? (
            <p className='text-sm text-gray-600 text-center py-6'>
              Пока нет изображений. Загрузите или вставьте изображение для начала.
            </p>
          ) : (
            <div className='space-y-3 max-h-80 overflow-y-auto'>
              {images.map(img => (
                <div
                  key={img.id}
                  className='flex items-start gap-3 p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors'
                >
                  <img
                    src={img.dataUrl}
                    alt='Saved screenshot'
                    className='w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0'
                    onClick={() => handleSelect(img)}
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{img.name || 'Без названия'}</p>
                    <p className='text-xs text-gray-600'>
                      {new Date(img.created).toLocaleDateString()} at{' '}
                      {new Date(img.created).toLocaleTimeString()}
                    </p>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleSelect(img)}
                      className='mt-1 h-6 px-2 text-xs'
                    >
                      Показать
                    </Button>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleDelete(img.id)}
                    className='h-8 w-8 text-gray-600 hover:text-red-600 flex-shrink-0'
                  >
                    <TrashIcon className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
    </Card>
  );
}
