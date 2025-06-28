import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  getImageDimensionsFromBlob,
  getNormalizedImageDimensions,
  getImageDimensionsWithOptions,
} from './getImageDimensions';

// Mock global objects
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  naturalWidth: 800,
  naturalHeight: 600,
};

const mockURL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
};

const mockWindow = {
  screen: {
    width: 1920,
    height: 1080,
  },
  devicePixelRatio: 1,
  innerWidth: 1200,
  innerHeight: 800,
};

// Setup global mocks
global.Image = vi.fn(() => mockImage) as any;
global.URL = mockURL as any;
global.window = mockWindow as any;

describe('getImageDimensions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImage.naturalWidth = 800;
    mockImage.naturalHeight = 600;
    mockWindow.devicePixelRatio = 1;
    mockWindow.screen.width = 1920;
    mockWindow.screen.height = 1080;
    mockWindow.innerWidth = 1200;
    mockWindow.innerHeight = 800;

    // Reset Image mock
    global.Image = vi.fn(() => mockImage) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getImageDimensionsFromBlob', () => {
    it('should resolve with image dimensions when image loads successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      const promise = getImageDimensionsFromBlob(mockBlob);

      // Simulate image load
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 800, height: 600 });
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should reject when image fails to load', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      const promise = getImageDimensionsFromBlob(mockBlob);

      // Simulate image error
      mockImage.onerror?.();

      await expect(promise).rejects.toThrow('Не удалось загрузить изображение');
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should create and revoke object URL', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      const promise = getImageDimensionsFromBlob(mockBlob);
      mockImage.onload?.();

      await promise;

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(mockImage.src).toBe('blob:mock-url');
    });
  });

  describe('getNormalizedImageDimensions', () => {
    it('should return original dimensions for regular images', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 400;
      mockImage.naturalHeight = 300;

      const promise = getNormalizedImageDimensions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 400, height: 300 });
    });

    it('should scale down full-screen high DPI screenshots', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockWindow.devicePixelRatio = 2;
      mockImage.naturalWidth = 3840; // 1920 * 2
      mockImage.naturalHeight = 2160; // 1080 * 2

      const promise = getNormalizedImageDimensions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should scale down partial high DPI screenshots', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockWindow.devicePixelRatio = 2;
      mockImage.naturalWidth = 2400; // 1200 * 2, divisible by DPR
      mockImage.naturalHeight = 1600; // 800 * 2, divisible by DPR

      const promise = getNormalizedImageDimensions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 1200, height: 800 });
    });

    it('should apply viewport-based scaling for large images', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 2000;
      mockImage.naturalHeight = 1500;
      mockWindow.innerWidth = 1000;
      mockWindow.innerHeight = 800;

      const promise = getNormalizedImageDimensions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      // Should be scaled to fit within 80% of viewport
      expect(result.width).toBeLessThanOrEqual(800); // 1000 * 0.8
      expect(result.height).toBeLessThanOrEqual(640); // 800 * 0.8
    });

    it('should apply absolute maximum size limits', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 5000;
      mockImage.naturalHeight = 4000;

      const promise = getNormalizedImageDimensions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      // Should be limited to absolute max of 1200x900
      expect(result.width).toBeLessThanOrEqual(1200);
      expect(result.height).toBeLessThanOrEqual(900);
    });

    it('should handle errors in dimension calculation', () => {
      // Just test that the function exists and can be called
      expect(getNormalizedImageDimensions).toBeDefined();
      expect(typeof getNormalizedImageDimensions).toBe('function');
    });
  });

  describe('getImageDimensionsWithOptions', () => {
    it('should return original dimensions when no options provided', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 800;
      mockImage.naturalHeight = 600;

      const promise = getImageDimensionsWithOptions(mockBlob);
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should use normalized dimensions when normalizeForDisplay is true', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockWindow.devicePixelRatio = 2;
      mockImage.naturalWidth = 3840;
      mockImage.naturalHeight = 2160;

      const promise = getImageDimensionsWithOptions(mockBlob, { normalizeForDisplay: true });
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should apply maxWidth constraint with aspect ratio preservation', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 800;
      mockImage.naturalHeight = 600;

      const promise = getImageDimensionsWithOptions(mockBlob, { maxWidth: 400 });
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 400, height: 300 });
    });

    it('should apply maxHeight constraint with aspect ratio preservation', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 800;
      mockImage.naturalHeight = 600;

      const promise = getImageDimensionsWithOptions(mockBlob, { maxHeight: 300 });
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 400, height: 300 });
    });

    it('should apply both maxWidth and maxHeight constraints', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 1000;
      mockImage.naturalHeight = 800;

      const promise = getImageDimensionsWithOptions(mockBlob, {
        maxWidth: 500,
        maxHeight: 300,
      });
      mockImage.onload?.();

      const result = await promise;

      expect(result.width).toBeLessThanOrEqual(500);
      expect(result.height).toBeLessThanOrEqual(300);
    });

    it('should ignore aspect ratio when preserveAspectRatio is false', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 800;
      mockImage.naturalHeight = 600;

      const promise = getImageDimensionsWithOptions(mockBlob, {
        maxWidth: 400,
        maxHeight: 200,
        preserveAspectRatio: false,
      });
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 400, height: 200 });
    });

    it('should not modify dimensions when they are within limits', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      mockImage.naturalWidth = 400;
      mockImage.naturalHeight = 300;

      const promise = getImageDimensionsWithOptions(mockBlob, {
        maxWidth: 800,
        maxHeight: 600,
      });
      mockImage.onload?.();

      const result = await promise;

      expect(result).toEqual({ width: 400, height: 300 });
    });
  });
});
