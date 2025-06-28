import { logWarn } from './logger';

// Типы для области хранения
export type ChromeStorageArea = 'local' | 'sync' | 'session';

// Функция для чтения из chrome.storage
export const getFromChromeStorage = async <T>(
  key: string,
  defaultValue: T | null = null,
  area: ChromeStorageArea = 'local'
): Promise<T | null> => {
  try {
    // Проверяем доступность chrome.storage
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return defaultValue;
    }

    const storageArea = chrome.storage[area];
    const result = await storageArea.get([key]);

    // Если ключ существует, возвращаем значение, иначе defaultValue
    return result[key] !== undefined ? result[key] : defaultValue;
  } catch (error) {
    logWarn(`Ошибка чтения из chrome.storage.${area}:`, error);
    return defaultValue;
  }
};

// Функция для записи в chrome.storage
export const setToChromeStorage = async (
  key: string,
  value: any,
  area: ChromeStorageArea = 'local'
): Promise<boolean> => {
  try {
    // Проверяем доступность chrome.storage
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return false;
    }

    const storageArea = chrome.storage[area];
    await storageArea.set({ [key]: value });
    return true;
  } catch (error) {
    logWarn(`Ошибка записи в chrome.storage.${area}:`, error);
    return false;
  }
};

// Функция для удаления из chrome.storage
export const removeFromChromeStorage = async (
  key: string | string[],
  area: ChromeStorageArea = 'local'
): Promise<boolean> => {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return false;
    }

    const storageArea = chrome.storage[area];
    await storageArea.remove(key);
    return true;
  } catch (error) {
    logWarn(`Ошибка удаления из chrome.storage.${area}:`, error);
    return false;
  }
};

// Функция для очистки chrome.storage
export const clearChromeStorage = async (area: ChromeStorageArea = 'local'): Promise<boolean> => {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return false;
    }

    const storageArea = chrome.storage[area];
    await storageArea.clear();
    return true;
  } catch (error) {
    logWarn(`Ошибка очистки chrome.storage.${area}:`, error);
    return false;
  }
};

// Функция для получения всех данных из chrome.storage
export const getAllFromChromeStorage = async <T = Record<string, any>>(
  area: ChromeStorageArea = 'local'
): Promise<T | null> => {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return null;
    }

    const storageArea = chrome.storage[area];
    const result = await storageArea.get(null); // null означает получить все
    return result as T;
  } catch (error) {
    logWarn(`Ошибка получения всех данных из chrome.storage.${area}:`, error);
    return null;
  }
};

// Функция для получения информации об использованном пространстве
export const getChromeStorageUsage = async (
  area: ChromeStorageArea = 'local'
): Promise<number | null> => {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      logWarn('Chrome storage API недоступен');
      return null;
    }

    const storageArea = chrome.storage[area];

    // getBytesInUse доступен только для local и sync
    if (area === 'session') {
      logWarn('getBytesInUse недоступен для session storage');
      return null;
    }

    const usage = await storageArea.getBytesInUse();
    return usage;
  } catch (error) {
    logWarn(`Ошибка получения информации об использовании chrome.storage.${area}:`, error);
    return null;
  }
};

// Хук для прослушивания изменений в chrome.storage (если используете React)
export const useChromeStorageListener = (
  callback: (changes: chrome.storage.StorageChange, areaName: string) => void
) => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(callback);

    // Возвращаем функцию для отписки
    return () => {
      chrome.storage.onChanged.removeListener(callback);
    };
  }

  return () => {}; // Пустая функция если API недоступен
};
