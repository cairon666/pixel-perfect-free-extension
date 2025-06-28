import { createCtx } from '@reatom/core';
import { reatomContext } from '@reatom/npm-react';

import { initSavedImages } from './atoms';

// Создаем контекст Reatom
export const ctx = createCtx();
initSavedImages(ctx);

// React provider для использования в компонентах
export const ReatomProvider = reatomContext.Provider;

/**
 * Главный экспорт store
 */

// Экспорт всех атомов
export * from './atoms';

// Экспорт всех actions
export * from './actions';

// Экспорт типов
export * from './types';
