import { createCtx } from '@reatom/core';
import { reatomContext } from '@reatom/npm-react';

// Создаем контекст Reatom
export const ctx = createCtx();

// React provider для использования в компонентах
export const ReatomProvider = reatomContext.Provider;

// Экспортируем все атомы и действия
export * from './atoms'; 
export * from './types';