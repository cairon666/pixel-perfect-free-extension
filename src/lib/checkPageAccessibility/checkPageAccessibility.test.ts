import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { checkPageAccessibility } from './checkPageAccessibility';

// Mock chrome API
const mockChrome = {
  extension: {
    isAllowedFileSchemeAccess: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  runtime: {
    lastError: null,
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('checkPageAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChrome.runtime.lastError = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for undefined url', async () => {
    const result = await checkPageAccessibility(1, undefined);
    expect(result).toBe(false);
  });

  it('should return false for null url', async () => {
    const result = await checkPageAccessibility(1, null as any);
    expect(result).toBe(false);
  });

  it('should return false for empty string url', async () => {
    const result = await checkPageAccessibility(1, '');
    expect(result).toBe(false);
  });

  describe('file:// URLs', () => {
    it('should check file scheme access when API is available and return true', async () => {
      mockChrome.extension.isAllowedFileSchemeAccess.mockImplementation(callback => {
        callback(true);
      });

      const result = await checkPageAccessibility(1, 'file:///path/to/file.html');
      expect(result).toBe(true);
      expect(mockChrome.extension.isAllowedFileSchemeAccess).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should check file scheme access when API is available and return false', async () => {
      mockChrome.extension.isAllowedFileSchemeAccess.mockImplementation(callback => {
        callback(false);
      });

      const result = await checkPageAccessibility(1, 'file:///path/to/file.html');
      expect(result).toBe(false);
    });

    it('should fallback to executeScript when isAllowedFileSchemeAccess is not available', async () => {
      // @ts-ignore
      mockChrome.extension.isAllowedFileSchemeAccess = undefined;
      mockChrome.scripting.executeScript.mockImplementation((options, callback) => {
        callback();
      });

      const result = await checkPageAccessibility(1, 'file:///path/to/file.html');
      expect(result).toBe(true);
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith(
        {
          target: { tabId: 1 },
          func: expect.any(Function),
        },
        expect.any(Function)
      );
    });

    it('should return false when executeScript fails for file URLs', async () => {
      // @ts-ignore
      mockChrome.extension.isAllowedFileSchemeAccess = undefined;
      // @ts-ignore
      mockChrome.runtime.lastError = { message: 'Access denied' };
      mockChrome.scripting.executeScript.mockImplementation((options, callback) => {
        callback();
      });

      const result = await checkPageAccessibility(1, 'file:///path/to/file.html');
      expect(result).toBe(false);
    });
  });

  describe('regular URLs', () => {
    it('should return true for accessible regular URLs', async () => {
      mockChrome.scripting.executeScript.mockResolvedValue([]);

      const result = await checkPageAccessibility(1, 'https://example.com');
      expect(result).toBe(true);
      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });

    it('should return false when executeScript throws an error', async () => {
      mockChrome.scripting.executeScript.mockRejectedValue(new Error('Permission denied'));

      const result = await checkPageAccessibility(1, 'https://restricted.com');
      expect(result).toBe(false);
    });

    it('should return false for localhost when access is denied', async () => {
      mockChrome.scripting.executeScript.mockRejectedValue(new Error('Access denied'));

      const result = await checkPageAccessibility(1, 'http://localhost:3000');
      expect(result).toBe(false);
    });
  });

  it('should call executeScript with correct tabId', async () => {
    mockChrome.scripting.executeScript.mockResolvedValue([]);

    await checkPageAccessibility(123, 'https://example.com');
    expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 123 },
      func: expect.any(Function),
    });
  });
});
