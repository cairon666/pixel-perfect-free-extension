import { atom } from '@reatom/core';

import { STORE_DEFAULTS } from '../../consts';

/**
 * Атомы для настроек overlay поведения
 */

// Прозрачность overlay (0-100)
export const opacityAtom = atom<number>(STORE_DEFAULTS.OVERLAY_OPACITY, 'opacityAtom');

// Блокировка перемещения overlay
export const isLockedAtom = atom(false, 'isLockedAtom');

// Режим показа различий
export const isDiffModeAtom = atom(false, 'isDiffModeAtom');

// Режим центрирования
export const isCenteredAtom = atom(false, 'isCenteredAtom');
