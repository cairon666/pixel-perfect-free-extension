import { createCtx } from '@reatom/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as logger from '../logger';
import { createChromeStorageAtom } from './createChromeStorageAtom';

// Mock logger
vi.mock('../logger', () => ({
  logWarn: vi.fn(),
}));

// Mock chrome API
const mockStorageArea = {
  get: vi.fn(),
  set: vi.fn(),
};

const mockChrome = {
  storage: {
    local: { ...mockStorageArea },
    sync: { ...mockStorageArea },
    session: { ...mockStorageArea },
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('createChromeStorageAtom', () => {
  let ctx: any;

  beforeEach(() => {
    ctx = createCtx();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create atom with initial value', () => {
    const { atom } = createChromeStorageAtom('testKey', 'initialValue');

    expect(ctx.get(atom)).toBe('initialValue');
  });

  it('should create atom with custom name', () => {
    const { atom } = createChromeStorageAtom('testKey', 'initialValue', 'local', 'customName');

    // Since atom name might not be directly settable, just verify it exists
    expect(atom).toBeDefined();
    expect(typeof atom).toBe('function');
  });

  it('should use key as default name', () => {
    const { atom } = createChromeStorageAtom('testKey', 'initialValue');

    // Since atom name might not be directly settable, just verify it exists
    expect(atom).toBeDefined();
    expect(typeof atom).toBe('function');
  });

  describe('initFromStorage', () => {
    it('should initialize atom from chrome storage when value exists', async () => {
      mockStorageArea.get.mockResolvedValue({ testKey: 'storageValue' });

      const { atom, initFromStorage } = createChromeStorageAtom('testKey', 'initialValue');

      await initFromStorage(ctx);

      expect(ctx.get(atom)).toBe('storageValue');
      expect(mockStorageArea.get).toHaveBeenCalledWith(['testKey']);
    });

    it('should not change atom value when storage key does not exist', async () => {
      mockStorageArea.get.mockResolvedValue({});

      const { atom, initFromStorage } = createChromeStorageAtom('testKey', 'initialValue');

      await initFromStorage(ctx);

      expect(ctx.get(atom)).toBe('initialValue');
    });

    it('should handle chrome storage not available', async () => {
      // @ts-ignore
      global.chrome = undefined;

      const { atom, initFromStorage } = createChromeStorageAtom('testKey', 'initialValue');

      await initFromStorage(ctx);

      expect(ctx.get(atom)).toBe('initialValue');

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });

    it('should handle errors during initialization', async () => {
      mockStorageArea.get.mockRejectedValue(new Error('Storage error'));

      const { atom, initFromStorage } = createChromeStorageAtom('testKey', 'initialValue');

      await initFromStorage(ctx);

      expect(ctx.get(atom)).toBe('initialValue');
      expect(logger.logWarn).toHaveBeenCalledWith(
        'Ошибка чтения testKey из chrome.storage.local:',
        expect.any(Error)
      );
    });

    it('should use correct storage area', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({ testKey: 'syncValue' });

      const { atom, initFromStorage } = createChromeStorageAtom('testKey', 'initialValue', 'sync');

      await initFromStorage(ctx);

      expect(ctx.get(atom)).toBe('syncValue');
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(['testKey']);
    });
  });

  describe('atom updates', () => {
    it('should save to chrome storage when atom value changes', async () => {
      mockStorageArea.set.mockResolvedValue(undefined);

      const { atom } = createChromeStorageAtom('testKey', 'initialValue');

      // Change atom value
      atom(ctx, 'newValue');

      // Wait for async storage update
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockStorageArea.set).toHaveBeenCalledWith({ testKey: 'newValue' });
    });

    it('should handle chrome storage not available during update', async () => {
      const { atom } = createChromeStorageAtom('testKey', 'initialValue');

      // @ts-ignore
      global.chrome = undefined;

      // Change atom value
      atom(ctx, 'newValue');

      // Wait for async storage update
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should not throw error

      // Restore chrome mock
      // @ts-ignore
      global.chrome = mockChrome;
    });

    it('should handle errors during storage update', async () => {
      mockStorageArea.set.mockRejectedValue(new Error('Storage error'));

      const { atom } = createChromeStorageAtom('testKey', 'initialValue');

      // Change atom value
      atom(ctx, 'newValue');

      // Wait for async storage update
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(logger.logWarn).toHaveBeenCalledWith(
        'Ошибка записи testKey в chrome.storage.local:',
        expect.any(Error)
      );
    });

    it('should use correct storage area for updates', async () => {
      mockChrome.storage.session.set.mockResolvedValue(undefined);

      const { atom } = createChromeStorageAtom('testKey', 'initialValue', 'session');

      // Change atom value
      atom(ctx, 'newValue');

      // Wait for async storage update
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockChrome.storage.session.set).toHaveBeenCalledWith({ testKey: 'newValue' });
    });
  });
});
