import { useAtom, useAction } from '@reatom/npm-react';
import { memo } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi';
import { TbLayersDifference } from 'react-icons/tb';
import { cn } from 'src/lib/utils';
import {
  opacityAtom,
  isLockedAtom,
  isDiffModeAtom,
  isImagePanelVisibleAtom,
  setDiffModeAction,
  setLockedAction,
  toggleOpacityAction,
  setImagePanelVisibleAction,
} from 'src/store';

export const MenuButtons = memo(() => {
  const [opacity] = useAtom(opacityAtom);
  const [isLocked] = useAtom(isLockedAtom);
  const [isDiffMode] = useAtom(isDiffModeAtom);
  const [isImagePanelVisible] = useAtom(isImagePanelVisibleAtom);

  const setDiffMode = useAction(setDiffModeAction);
  const setLocked = useAction(setLockedAction);
  const onToggleOpacity = useAction(toggleOpacityAction);
  const setImagePanelVisible = useAction(setImagePanelVisibleAction);

  const onToggleDiff = () => setDiffMode(!isDiffMode);
  const onToggleLock = () => setLocked(!isLocked);
  const onToggleImagePanel = () => setImagePanelVisible(!isImagePanelVisible);

  return (
    <div className='flex'>
      {/* Кнопка меню добавления картинки */}
      <button
        data-testid='ppe-toggle-image-panel'
        type='button'
        onClick={onToggleImagePanel}
        className={cn(
          'cursor-pointer h-12 flex items-center justify-center text-lg transition-all duration-200 border-2 w-full',
          {
            'bg-green-100 text-green-800 border-green-300': isImagePanelVisible,
            'hover:bg-gray-100': !isImagePanelVisible,
          }
        )}
        title={
          isImagePanelVisible
            ? 'Скрыть меню добавления картинки'
            : 'Открыть меню добавления картинки'
        }
      >
        {isImagePanelVisible ? <AiOutlineMinus size={18} /> : <AiOutlinePlus size={18} />}
      </button>

      {/* Кнопка глаз для opacity */}
      <button
        type='button'
        onClick={onToggleOpacity}
        className={cn(
          'cursor-pointer h-12 flex items-center justify-center text-lg transition-all duration-200 border-2 w-full',
          {
            'bg-orange-100 text-orange-800 border-orange-300': opacity === 0,
            'hover:bg-gray-100': opacity !== 0,
          }
        )}
        title={opacity === 0 ? 'Показать изображение' : 'Скрыть изображение'}
      >
        {opacity === 0 ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>

      {/* Кнопка замок для движения */}
      <button
        type='button'
        onClick={onToggleLock}
        className={cn(
          'cursor-pointer h-12 flex items-center justify-center text-lg transition-all duration-200 border-2 w-full',
          {
            'bg-red-100 text-red-800 border-red-300': isLocked,
            'hover:bg-gray-100': !isLocked,
          }
        )}
        title={isLocked ? 'Разблокировать движение' : 'Заблокировать движение'}
      >
        {isLocked ? <FiLock size={18} /> : <FiUnlock size={18} />}
      </button>

      {/* Кнопка режима различий */}
      <button
        type='button'
        onClick={onToggleDiff}
        className={cn(
          'cursor-pointer h-12 flex items-center justify-center text-lg transition-all duration-200 border-2 w-full',
          {
            'bg-purple-100 text-purple-800 border-purple-300': isDiffMode,
            'hover:bg-gray-100': !isDiffMode,
          }
        )}
        title={isDiffMode ? 'Отключить режим различий' : 'Включить режим различий'}
      >
        <TbLayersDifference size={18} />
      </button>
    </div>
  );
});

MenuButtons.displayName = 'MenuButtons';
