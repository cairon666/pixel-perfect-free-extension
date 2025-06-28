import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as logger from '../logger';
import {
  getFromChromeStorage,
  setToChromeStorage,
  removeFromChromeStorage,
  clearChromeStorage,
  getAllFromChromeStorage,
  getChromeStorageUsage,
  useChromeStorageListener,
} from './chromeStorage';

// Mock logger
vi.mock('../logger', () => ({
  logWarn: vi.fn(),
}));

// Mock chrome API
const mockStorageArea = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  getBytesInUse: vi.fn(),
};

const mockChrome = {
  storage: {
    local: { ...mockStorageArea },
    sync: { ...mockStorageArea },
    session: { ...mockStorageArea },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('chromeStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFromChromeStorage', () => {
    it('should return value from storage when key exists', async () => {
      mockStorageArea.get.mockResolvedValue({ testKey: 'testValue' });

      const result = await getFromChromeStorage('testKey', 'defaultValue');
      expect(result).toBe('testValue');
      expect(mockStorageArea.get).toHaveBeenCalledWith(['testKey']);
    });

    it('should return default value when key does not exist', async () => {
      mockStorageArea.get.mockResolvedValue({});

      const result = await getFromChromeStorage('testKey', 'defaultValue');
      expect(result).toBe('defaultValue');
    });

    it('should return default value when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await getFromChromeStorage('testKey', 'defaultValue');
      expect(result).toBe('defaultValue');
      expect(logger.logWarn).toHaveBeenCalledWith('Chrome storage API недоступен');

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });

    it('should use correct storage area', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({ testKey: 'syncValue' });

      const result = await getFromChromeStorage('testKey', null, 'sync');
      expect(result).toBe('syncValue');
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(['testKey']);
    });

    it('should handle errors and return default value', async () => {
      mockStorageArea.get.mockRejectedValue(new Error('Storage error'));

      const result = await getFromChromeStorage('testKey', 'defaultValue');
      expect(result).toBe('defaultValue');
      expect(logger.logWarn).toHaveBeenCalledWith(
        'Ошибка чтения из chrome.storage.local:',
        expect.any(Error)
      );
    });
  });

  describe('setToChromeStorage', () => {
    it('should set value to storage and return true', async () => {
      mockStorageArea.set.mockResolvedValue(undefined);

      const result = await setToChromeStorage('testKey', 'testValue');
      expect(result).toBe(true);
      expect(mockStorageArea.set).toHaveBeenCalledWith({ testKey: 'testValue' });
    });

    it('should return false when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await setToChromeStorage('testKey', 'testValue');
      expect(result).toBe(false);
      expect(logger.logWarn).toHaveBeenCalledWith('Chrome storage API недоступен');

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });

    it('should use correct storage area', async () => {
      mockChrome.storage.session.set.mockResolvedValue(undefined);

      const result = await setToChromeStorage('testKey', 'testValue', 'session');
      expect(result).toBe(true);
      expect(mockChrome.storage.session.set).toHaveBeenCalledWith({ testKey: 'testValue' });
    });

    it('should handle errors and return false', async () => {
      mockStorageArea.set.mockRejectedValue(new Error('Storage error'));

      const result = await setToChromeStorage('testKey', 'testValue');
      expect(result).toBe(false);
      expect(logger.logWarn).toHaveBeenCalledWith(
        'Ошибка записи в chrome.storage.local:',
        expect.any(Error)
      );
    });
  });

  describe('removeFromChromeStorage', () => {
    it('should remove single key and return true', async () => {
      mockStorageArea.remove.mockResolvedValue(undefined);

      const result = await removeFromChromeStorage('testKey');
      expect(result).toBe(true);
      expect(mockStorageArea.remove).toHaveBeenCalledWith('testKey');
    });

    it('should remove multiple keys and return true', async () => {
      mockStorageArea.remove.mockResolvedValue(undefined);

      const result = await removeFromChromeStorage(['key1', 'key2']);
      expect(result).toBe(true);
      expect(mockStorageArea.remove).toHaveBeenCalledWith(['key1', 'key2']);
    });

    it('should return false when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await removeFromChromeStorage('testKey');
      expect(result).toBe(false);

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });

    it('should handle errors and return false', async () => {
      mockStorageArea.remove.mockRejectedValue(new Error('Storage error'));

      const result = await removeFromChromeStorage('testKey');
      expect(result).toBe(false);
    });
  });

  describe('clearChromeStorage', () => {
    it('should clear storage and return true', async () => {
      mockStorageArea.clear.mockResolvedValue(undefined);

      const result = await clearChromeStorage();
      expect(result).toBe(true);
      expect(mockStorageArea.clear).toHaveBeenCalled();
    });

    it('should return false when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await clearChromeStorage();
      expect(result).toBe(false);

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });
  });

  describe('getAllFromChromeStorage', () => {
    it('should get all data from storage', async () => {
      const mockData = { key1: 'value1', key2: 'value2' };
      mockStorageArea.get.mockResolvedValue(mockData);

      const result = await getAllFromChromeStorage();
      expect(result).toEqual(mockData);
      expect(mockStorageArea.get).toHaveBeenCalledWith(null);
    });

    it('should return null when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await getAllFromChromeStorage();
      expect(result).toBeNull();

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });
  });

  describe('getChromeStorageUsage', () => {
    it('should get storage usage for local area', async () => {
      mockChrome.storage.local.getBytesInUse.mockResolvedValue(1024);

      const result = await getChromeStorageUsage('local');
      expect(result).toBe(1024);
      expect(mockChrome.storage.local.getBytesInUse).toHaveBeenCalled();
    });

    it('should return null for session storage', async () => {
      const result = await getChromeStorageUsage('session');
      expect(result).toBeNull();
      expect(logger.logWarn).toHaveBeenCalledWith('getBytesInUse недоступен для session storage');
    });

    it('should return null when chrome.storage is not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const result = await getChromeStorageUsage();
      expect(result).toBeNull();

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });
  });

  describe('useChromeStorageListener', () => {
    it('should add listener and return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = useChromeStorageListener(callback);

      expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalledWith(callback);

      unsubscribe();
      expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalledWith(callback);
    });

    it('should return empty function when chrome.storage is not available', () => {
      // @ts-ignore
      global.chrome = undefined;

      const callback = vi.fn();
      const unsubscribe = useChromeStorageListener(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // Should not throw

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });
  });
});
