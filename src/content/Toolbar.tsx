import React from 'react';

import { cn } from '../lib/utils';

interface ToolbarProps {
  opacity: number;
  onOpacityChange: (value: number) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  isDiffMode: boolean;
  onToggleDiff: () => void;
  onClose: () => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function Toolbar({
  opacity,
  onOpacityChange,
  isLocked,
  onToggleLock,
  isDiffMode,
  onToggleDiff,
  onClose,
  onMove,
}: ToolbarProps) {
  return (
    <div className='fixed top-2.5 right-2.5 bg-black/90 text-white p-4 rounded-lg text-sm pointer-events-auto shadow-xl min-w-[320px] font-sans'>
      {/* Top row with opacity, lock, diff mode, and close controls */}
      <div className='flex items-center gap-2 mb-2'>
        <span>Прозрачность:</span>
        <input
          type='range'
          min='0'
          max='100'
          value={opacity}
          onChange={e => onOpacityChange(Number(e.target.value))}
          className='w-24 mx-1'
        />
        <span className='min-w-[30px]'>{opacity}%</span>
        <button
          type='button'
          onClick={onToggleLock}
          className={cn(
            'w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded border-none text-white ml-2',
            {
              'bg-red-500/80': isLocked,
              'bg-blue-500/80': !isLocked,
            }
          )}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
        <button
          type='button'
          onClick={onToggleDiff}
          className={cn(
            'w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded border-none text-white ml-1',
            {
              'bg-purple-500/80': isDiffMode,
              'bg-gray-500/80': !isDiffMode,
            }
          )}
          title={isDiffMode ? 'Отключить режим различий' : 'Включить режим различий'}
        >
          {isDiffMode ? '👁️' : '👓'}
        </button>
        <button
          type='button'
          onClick={onClose}
          className='w-8 h-8 flex items-center justify-center text-base cursor-pointer rounded border-none text-white bg-red-500/80 ml-auto'
        >
          ×
        </button>
      </div>
      {/* Movement controls */}
      <div className='grid grid-cols-3 gap-1 items-center justify-items-center'>
        <button
          type='button'
          onClick={() => !isLocked && onMove('up')}
          className={cn(
            'col-start-2 w-8 h-8 flex items-center justify-center text-sm rounded border border-gray-400/30 text-white bg-gray-700/80',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
        >
          ↑
        </button>
        <button
          type='button'
          onClick={() => !isLocked && onMove('left')}
          className={cn(
            'w-8 h-8 flex items-center justify-center text-sm rounded border border-gray-400/30 text-white bg-gray-700/80',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
        >
          ←
        </button>
        <button
          type='button'
          onClick={() => !isLocked && onMove('right')}
          className={cn(
            'w-8 h-8 flex items-center justify-center text-sm rounded border border-gray-400/30 text-white bg-gray-700/80',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
        >
          →
        </button>
        <button
          type='button'
          onClick={() => !isLocked && onMove('down')}
          className={cn(
            'col-start-2 w-8 h-8 flex items-center justify-center text-sm rounded border border-gray-400/30 text-white bg-gray-700/80',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
