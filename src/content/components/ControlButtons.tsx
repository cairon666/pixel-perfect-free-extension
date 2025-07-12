import { FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight, FiTarget } from 'react-icons/fi';
import { cn } from 'src/lib/utils';
import { MoveDirection } from 'src/store';

interface ControlButtonsProps {
  onMove: (direction: MoveDirection) => void;
  isLocked: boolean;
  isCentered?: boolean;
  onToggleCenter?: () => void;
}

export function ControlButtons({
  onMove,
  isLocked,
  isCentered,
  onToggleCenter,
}: ControlButtonsProps) {
  return (
    <div className='flex flex-col items-center flex-1'>
      <div className='relative w-[100px] h-[100px] flex-shrink-0'>
        {/* Стрелка вверх */}
        <button
          type='button'
          onClick={() => onMove?.('up')}
          className={cn(
            'absolute w-8 h-8 flex items-center justify-center text-xs rounded bg-white hover:bg-gray-50 transition-all',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
          style={{
            top: '0px',
            left: '33px',
            border: '1px solid black',
          }}
          disabled={isLocked}
          title='Переместить вверх'
        >
          <FiArrowUp size={14} />
        </button>

        {/* Стрелка влево */}
        <button
          type='button'
          onClick={() => onMove?.('left')}
          className={cn(
            'absolute w-8 h-8 flex items-center justify-center text-xs rounded bg-white hover:bg-gray-50 transition-all',
            {
              'cursor-not-allowed opacity-50': isLocked || isCentered,
              'cursor-pointer': !isLocked && !isCentered,
            }
          )}
          style={{
            top: '34px',
            left: '0px',
            border: '1px solid black',
          }}
          disabled={isLocked || isCentered}
          title={isCentered ? 'Отключен в режиме центрирования' : 'Переместить влево'}
        >
          <FiArrowLeft size={14} />
        </button>

        {/* Кнопка центрирования */}
        <button
          type='button'
          onClick={() => onToggleCenter?.()}
          className={cn(
            'absolute w-8 h-8 flex items-center justify-center text-xs rounded hover:bg-gray-50 transition-all',
            {
              'bg-blue-100 text-blue-800': isCentered,
              'bg-white text-gray-700': !isCentered,
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
          style={{
            top: '34px',
            left: '33px',
            border: '1px solid black',
          }}
          disabled={isLocked}
          title={isCentered ? 'Отключить центрирование' : 'Включить центрирование'}
        >
          <FiTarget size={14} />
        </button>

        {/* Стрелка вправо */}
        <button
          type='button'
          onClick={() => onMove?.('right')}
          className={cn(
            'absolute w-8 h-8 flex items-center justify-center text-xs rounded bg-white hover:bg-gray-50 transition-all',
            {
              'cursor-not-allowed opacity-50': isLocked || isCentered,
              'cursor-pointer': !isLocked && !isCentered,
            }
          )}
          style={{
            top: '34px',
            left: '66px',
            border: '1px solid black',
          }}
          disabled={isLocked || isCentered}
          title={isCentered ? 'Отключен в режиме центрирования' : 'Переместить вправо'}
        >
          <FiArrowRight size={14} />
        </button>

        {/* Стрелка вниз */}
        <button
          type='button'
          onClick={() => onMove?.('down')}
          className={cn(
            'absolute w-8 h-8 flex items-center justify-center text-xs rounded bg-white hover:bg-gray-50 transition-all',
            {
              'cursor-not-allowed opacity-50': isLocked,
              'cursor-pointer': !isLocked,
            }
          )}
          style={{
            bottom: '0px',
            left: '33px',
            border: '1px solid black',
          }}
          disabled={isLocked}
          title='Переместить вниз'
        >
          <FiArrowDown size={14} />
        </button>
      </div>
    </div>
  );
}
