import { atom, Ctx } from '@reatom/core';
import { onUpdate } from '@reatom/hooks';

import { ChromeStorageArea } from '../chromeStorage';
import { logWarn } from '../logger';

export const createChromeStorageAtom = <T>(
  key: string,
  initialValue: T,
  area: ChromeStorageArea = 'local',
  name = key
) => {
  // Создаем atom синхронно
  const storageAtom = atom(initialValue, name);

  // Функция для инициализации из storage
  const initFromStorage = async (ctx: Ctx) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageArea = chrome.storage[area];
        const result = await storageArea.get([key]);

        if (result[key] !== undefined) {
          storageAtom(ctx, () => result[key]);
        }
      }
    } catch (error) {
      logWarn(`Ошибка чтения ${key} из chrome.storage.${area}:`, error);
    }
  };

  // Подписываемся на изменения atom и сохраняем в chrome.storage
  onUpdate(storageAtom, async (ctx, newValue) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageArea = chrome.storage[area];
        await storageArea.set({ [key]: newValue });
      }
    } catch (error) {
      logWarn(`Ошибка записи ${key} в chrome.storage.${area}:`, error);
    }
  });

  // Возвращаем atom и функцию инициализации
  return { atom: storageAtom, initFromStorage };
};
