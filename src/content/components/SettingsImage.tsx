import { useAtom, useAction } from '@reatom/npm-react';
import { memo } from 'react';
import {
  isLockedAtom,
  isCenteredAtom,
  currentImageAtom,
  moveOverlayAction,
  setPositionAction,
  setOpacityAction,
  opacityAtom,
  toggleCenterAction,
} from 'src/store';

import { ControlButtons } from './ControlButtons';
import { ControlInputs } from './ControlInputs';

export const SettingsImage = memo(() => {
  const [opacity] = useAtom(opacityAtom);
  const [isLocked] = useAtom(isLockedAtom);
  const [isCentered] = useAtom(isCenteredAtom);
  const [currentImage] = useAtom(currentImageAtom);

  const onMove = useAction(moveOverlayAction);
  const setPostion = useAction(setPositionAction);
  const setOpacity = useAction(setOpacityAction);
  const onToggleCenter = useAction(toggleCenterAction);

  if (!currentImage) {
    return null;
  }

  return (
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
          imagePosition={currentImage?.position}
          onPositionChange={setPostion}
          isLocked={isLocked}
          isCentered={isCentered}
        />
      </div>

      {/* Слайдер прозрачности */}
      <div className='flex flex-col'>
        <div className='flex items-center gap-2 justify-between'>
          <span className='text-xs font-medium text-gray-700 min-w-[70px]'>Прозрачность:</span>
          <span className='text-xs text-gray-600 min-w-[25px]'>{opacity}%</span>
        </div>
        <div className='flex items-center gap-2 flex-1'>
          <input
            type='range'
            min='0'
            max='100'
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className='flex-1'
            title={`Прозрачность: ${opacity}%`}
          />
        </div>
      </div>
    </div>
  );
});

SettingsImage.displayName = 'SettingsImage';
