import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getCurrentActiveTab } from './getCurrentActiveTab';

// Mock chrome API
const mockChrome = {
  tabs: {
    query: vi.fn(),
  },
};

// @ts-ignore
global.chrome = mockChrome;

describe('getCurrentActiveTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the first active tab in current window', async () => {
    const mockTab = {
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      active: true,
      windowId: 1,
    };

    mockChrome.tabs.query.mockResolvedValue([mockTab]);

    const result = await getCurrentActiveTab();

    expect(result).toEqual(mockTab);
    expect(mockChrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
  });

  it('should return undefined when no active tabs found', async () => {
    mockChrome.tabs.query.mockResolvedValue([]);

    const result = await getCurrentActiveTab();

    expect(result).toBeUndefined();
    expect(mockChrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
  });

  it('should return first tab when multiple tabs returned', async () => {
    const mockTabs = [
      {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        active: true,
        windowId: 1,
      },
      {
        id: 2,
        url: 'https://test.com',
        title: 'Test',
        active: false,
        windowId: 1,
      },
    ];

    mockChrome.tabs.query.mockResolvedValue(mockTabs);

    const result = await getCurrentActiveTab();

    expect(result).toEqual(mockTabs[0]);
  });

  it('should handle chrome.tabs.query rejection', async () => {
    mockChrome.tabs.query.mockRejectedValue(new Error('Permission denied'));

    await expect(getCurrentActiveTab()).rejects.toThrow('Permission denied');
  });
});
