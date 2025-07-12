/* eslint-disable jsx-a11y/label-has-associated-control */
import { FiRotateCcw } from 'react-icons/fi';

interface ControlInputsProps {
  imagePosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  isLocked: boolean;
  isCentered?: boolean;
}
export function ControlInputs({
  imagePosition,
  onPositionChange,
  isLocked,
  isCentered,
}: ControlInputsProps) {
  const handleReset = () => {
    if (!isLocked) {
      onPositionChange?.({ x: 0, y: 0 });
    }
  };

  return (
    <div className='relative space-y-2'>
      {/* Кнопка сброса в правом верхнем углу */}
      <button
        type='button'
        onClick={handleReset}
        disabled={isLocked}
        className='cursor-pointer absolute -top-1 -right-1 p-1 text-gray-700 bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10'
        title={isLocked ? 'Заблокировано!' : 'Сбросить позицию к 0, 0'}
      >
        <FiRotateCcw size={12} />
      </button>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-gray-600 min-w-[15px] font-medium'>X:</label>
          <input
            type='number'
            value={imagePosition?.x || 0}
            onChange={e => {
              if (!isCentered) {
                onPositionChange?.({
                  x: Number(e.target.value),
                  y: imagePosition?.y || 0,
                });
              }
            }}
            className='w-16 px-2 py-1 text-xs border-2 border-gray-300 rounded-md focus:border-blue-400 focus:outline-none bg-white'
            disabled={isLocked || isCentered}
            title={isCentered ? 'Отключен в режиме центрирования' : 'X координата'}
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-gray-600 min-w-[15px] font-medium'>Y:</label>
          <input
            type='number'
            value={imagePosition?.y || 0}
            onChange={e =>
              onPositionChange?.({
                x: imagePosition?.x || 0,
                y: Number(e.target.value),
              })
            }
            className='w-16 px-2 py-1 text-xs border-2 border-gray-300 rounded-md focus:border-blue-400 focus:outline-none bg-white'
            disabled={isLocked}
          />
        </div>
      </div>
    </div>
  );
}
