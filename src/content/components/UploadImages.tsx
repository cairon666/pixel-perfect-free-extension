import { useAction } from '@reatom/npm-react';
import { memo, useRef } from 'react';
import { FiClipboard, FiUpload } from 'react-icons/fi';
import { getImageDimensionsWithOptions } from 'src/lib/getImageDimensions';
import { createImageAction, Position, Size } from 'src/store';

export const UploadImages = memo(() => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createImage = useAction(createImageAction);

  const addImageToStorage = (dataUrl: string, sizeH: number, sizeW: number) => {
    const id = crypto.randomUUID();
    const position: Position = { x: 0, y: 0 };
    const size: Size = { height: sizeH, width: sizeW };

    createImage(id, dataUrl, position, size);
  };

  const handlePaste = async () => {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      const imgType = item.types.find(t => t.startsWith('image/'));
      // eslint-disable-next-line no-continue
      if (!imgType) continue;

      // eslint-disable-next-line no-await-in-loop
      const blob = await item.getType(imgType);

      // eslint-disable-next-line no-await-in-loop
      const imageSize = await getImageDimensionsWithOptions(blob, {
        normalizeForDisplay: true,
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight,
      });

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        addImageToStorage(dataUrl, imageSize.height, imageSize.width);
      };
      reader.readAsDataURL(blob);
      break;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();

    const imageSize = await getImageDimensionsWithOptions(file, {
      normalizeForDisplay: true,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
    });

    reader.onload = () => {
      const dataUrl = reader.result as string;
      addImageToStorage(dataUrl, imageSize.height, imageSize.width);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className='grid grid-cols-2 gap-2'>
      <button
        type='button'
        onClick={handlePaste}
        className='px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-2'
      >
        <FiClipboard size={16} />
        Вставить
      </button>
      <button
        type='button'
        onClick={handleFileUpload}
        className='px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors flex items-center gap-2'
      >
        <FiUpload size={16} />
        Загрузить
      </button>

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
});

UploadImages.displayName = 'UploadImages';
