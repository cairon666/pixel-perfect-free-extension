import { cn } from 'src/lib/utils';
import {
  FiImage,
  FiFolder,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiSearch,
  FiBarChart,
} from 'react-icons/fi';

interface MenuButtonsProps {
  onToggleImagePanel: () => void;
  isImagePanelVisible: boolean;
  onToggleOpacity: () => void;
  opacity: number;
  onToggleLock: () => void;
  isLocked: boolean;
  onToggleDiff: () => void;
  isDiffMode: boolean;
}
export function MenuButtons({
  onToggleImagePanel,
  isImagePanelVisible,
  onToggleOpacity,
  opacity,
  onToggleLock,
  isLocked,
  onToggleDiff,
  isDiffMode,
}: MenuButtonsProps) {
  return (
    <div className='p-2 flex gap-1'>
      {/* Кнопка меню добавления картинки */}
      <button
        onClick={onToggleImagePanel}
        className={cn(
          'cursor-pointer w-12 h-12 flex items-center justify-center text-lg rounded-lg transition-all duration-200 border-2 w-full',
          {
            'bg-green-100 text-green-800 border-green-300 shadow-md': isImagePanelVisible,
            'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100': !isImagePanelVisible,
          }
        )}
        title={
          isImagePanelVisible
            ? 'Скрыть меню добавления картинки'
            : 'Открыть меню добавления картинки'
        }
      >
        {isImagePanelVisible ? <FiFolder size={18} /> : <FiImage size={18} />}
      </button>

      {/* Кнопка глаз для opacity */}
      <button
        onClick={onToggleOpacity}
        className={cn(
          'cursor-pointer w-12 h-12 flex items-center justify-center text-lg rounded-lg transition-all duration-200 border-2 w-full',
          {
            'bg-orange-100 text-orange-800 border-orange-300 shadow-md': opacity === 0,
            'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100': opacity !== 0,
          }
        )}
        title={opacity === 0 ? 'Показать изображение' : 'Скрыть изображение'}
      >
        {opacity === 0 ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>

      {/* Кнопка замок для движения */}
      <button
        onClick={onToggleLock}
        className={cn(
          'cursor-pointer w-12 h-12 flex items-center justify-center text-lg rounded-lg transition-all duration-200 border-2 w-full',
          {
            'bg-red-100 text-red-800 border-red-300 shadow-md': isLocked,
            'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100': !isLocked,
          }
        )}
        title={isLocked ? 'Разблокировать движение' : 'Заблокировать движение'}
      >
        {isLocked ? <FiLock size={18} /> : <FiUnlock size={18} />}
      </button>

      {/* Кнопка режима различий */}
      <button
        onClick={onToggleDiff}
        className={cn(
          'cursor-pointer w-12 h-12 flex items-center justify-center text-lg rounded-lg transition-all duration-200 border-2 w-full',
          {
            'bg-purple-100 text-purple-800 border-purple-300 shadow-md': isDiffMode,
            'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100': !isDiffMode,
          }
        )}
        title={isDiffMode ? 'Отключить режим различий' : 'Включить режим различий'}
      >
        {isDiffMode ? <FiSearch size={18} /> : <FiBarChart size={18} />}
      </button>
    </div>
  );
}
