import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as checkPageAccessibility from '../checkPageAccessibility';
import { canUseExtensionOnPage, canUseExtension } from './canUseExtension';

// Mock checkPageAccessibility module
vi.mock('../checkPageAccessibility', () => ({
  checkPageAccessibility: vi.fn(),
}));

describe('canUseExtensionOnPage', () => {
  it('should return false for undefined url', () => {
    expect(canUseExtensionOnPage(undefined)).toBe(false);
  });

  it('should return false for null url', () => {
    expect(canUseExtensionOnPage(null as any)).toBe(false);
  });

  it('should return false for empty string url', () => {
    expect(canUseExtensionOnPage('')).toBe(false);
  });

  describe('unsupported protocols', () => {
    const unsupportedProtocols = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'edge://',
      'about://',
      'data:',
      // eslint-disable-next-line no-script-url
      'javascript:',
      'mailto:',
      'tel:',
      'ftp://',
    ];

    it.each(unsupportedProtocols)('should return false for %s protocol', protocol => {
      expect(canUseExtensionOnPage(`${protocol}example`)).toBe(false);
    });
  });

  describe('unsupported domains', () => {
    const unsupportedDomains = [
      'chrome.google.com/webstore',
      'addons.mozilla.org',
      'microsoftedge.microsoft.com',
    ];

    it.each(unsupportedDomains)('should return false for %s domain', domain => {
      expect(canUseExtensionOnPage(`https://${domain}/something`)).toBe(false);
    });
  });

  it('should return true for file:// URLs', () => {
    expect(canUseExtensionOnPage('file:///path/to/file.html')).toBe(true);
  });

  it('should return true for regular HTTP URLs', () => {
    expect(canUseExtensionOnPage('http://example.com')).toBe(true);
  });

  it('should return true for regular HTTPS URLs', () => {
    expect(canUseExtensionOnPage('https://example.com')).toBe(true);
  });

  it('should return true for localhost URLs', () => {
    expect(canUseExtensionOnPage('http://localhost:3000')).toBe(true);
    expect(canUseExtensionOnPage('https://localhost:8080')).toBe(true);
  });
});

describe('canUseExtension', () => {
  const mockCheckPageAccessibility = vi.mocked(checkPageAccessibility.checkPageAccessibility);

  beforeEach(() => {
    mockCheckPageAccessibility.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when status is not complete', async () => {
    const result = await canUseExtension(1, 'loading', 'https://example.com');
    expect(result).toBe(false);
  });

  it('should return false when canUseExtensionOnPage returns false', async () => {
    const result = await canUseExtension(1, 'complete', 'chrome://extensions');
    expect(result).toBe(false);
  });

  it('should return false when checkPageAccessibility returns false', async () => {
    mockCheckPageAccessibility.mockResolvedValue(false);
    const result = await canUseExtension(1, 'complete', 'https://example.com');
    expect(result).toBe(false);
  });

  it('should return true when all conditions are met', async () => {
    const result = await canUseExtension(1, 'complete', 'https://example.com');
    expect(result).toBe(true);
    expect(mockCheckPageAccessibility).toHaveBeenCalledWith(1, 'https://example.com');
  });

  it('should handle undefined status', async () => {
    const result = await canUseExtension(1, undefined, 'https://example.com');
    expect(result).toBe(false);
  });

  it('should handle undefined url', async () => {
    const result = await canUseExtension(1, 'complete', undefined);
    expect(result).toBe(false);
  });

  it('should call checkPageAccessibility with correct parameters', async () => {
    await canUseExtension(123, 'complete', 'https://test.com');
    expect(mockCheckPageAccessibility).toHaveBeenCalledWith(123, 'https://test.com');
  });
});
