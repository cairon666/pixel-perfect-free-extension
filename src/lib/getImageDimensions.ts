export interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensionsFromBlob(blob: Blob): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Освобождаем URL после загрузки
      URL.revokeObjectURL(img.src);

      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Не удалось загрузить изображение'));
    };

    // Создаем URL из blob и назначаем его изображению
    img.src = URL.createObjectURL(blob);
  });
}

// Функция для нормализации размеров с учетом DPR и размеров экрана
export function getNormalizedImageDimensions(blob: Blob): Promise<ImageDimensions> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // Получаем оригинальные размеры изображения
      const originalDimensions = await getImageDimensionsFromBlob(blob);

      // Получаем информацию об экране
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Вычисляем физические размеры экрана (с учетом DPR)
      const physicalScreenWidth = screenWidth * devicePixelRatio;
      const physicalScreenHeight = screenHeight * devicePixelRatio;

      let { width, height } = originalDimensions;

      // Определяем, является ли изображение полноэкранным скриншотом высокого разрешения
      const isFullScreenHighDPIScreenshot =
        // Изображение примерно соответствует размерам экрана с учетом DPR
        (Math.abs(width - physicalScreenWidth) < 100 &&
          Math.abs(height - physicalScreenHeight) < 100) ||
        // Или изображение в точности соответствует размерам экрана с DPR > 1
        (devicePixelRatio > 1 &&
          ((width === physicalScreenWidth && height === physicalScreenHeight) ||
            (width === physicalScreenWidth && Math.abs(height - physicalScreenHeight) < 50) ||
            (height === physicalScreenHeight && Math.abs(width - physicalScreenWidth) < 50)));

      // Определяем, является ли изображение частичным скриншотом высокого разрешения
      const isPartialHighDPIScreenshot =
        devicePixelRatio > 1 &&
        // Изображение кратно DPR и больше определенного порога
        width % devicePixelRatio === 0 &&
        height % devicePixelRatio === 0 &&
        (width > 600 * devicePixelRatio || height > 400 * devicePixelRatio) &&
        // Но не является полноэкранным
        !isFullScreenHighDPIScreenshot;

      // Если это полноэкранный скриншот высокого разрешения
      if (isFullScreenHighDPIScreenshot && devicePixelRatio > 1) {
        width = Math.round(width / devicePixelRatio);
        height = Math.round(height / devicePixelRatio);
      }
      // Если это частичный скриншот высокого разрешения
      else if (isPartialHighDPIScreenshot) {
        width = Math.round(width / devicePixelRatio);
        height = Math.round(height / devicePixelRatio);
      }
      // Для всех остальных случаев применяем интеллектуальное ограничение
      else {
        // Определяем разумные максимальные размеры для overlay
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Максимальные размеры: 80% от viewport, но не меньше 800px по ширине
        const maxWidth = Math.max(viewportWidth * 0.8, Math.min(800, viewportWidth));
        const maxHeight = Math.max(viewportHeight * 0.8, Math.min(600, viewportHeight));

        // Применяем масштабирование только если изображение действительно большое
        if (width > maxWidth || height > maxHeight) {
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY);

          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        // Дополнительная проверка: если изображение всё ещё очень большое
        // (например, огромная фотография), ограничиваем до разумного размера
        const absoluteMaxWidth = 1200;
        const absoluteMaxHeight = 900;

        if (width > absoluteMaxWidth || height > absoluteMaxHeight) {
          const scaleX = absoluteMaxWidth / width;
          const scaleY = absoluteMaxHeight / height;
          const scale = Math.min(scaleX, scaleY);

          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
      }

      resolve({ width, height });
    } catch (error) {
      reject(error);
    }
  });
}

export interface GetImageDimensionsOptions {
  normalizeForDisplay?: boolean; // Нормализовать для отображения (учесть DPR)
  maxWidth?: number; // Максимальная ширина
  maxHeight?: number; // Максимальная высота
  preserveAspectRatio?: boolean; // Сохранять пропорции при масштабировании
}

export async function getImageDimensionsWithOptions(
  blob: Blob,
  options: GetImageDimensionsOptions = {}
): Promise<ImageDimensions> {
  const { normalizeForDisplay = false, maxWidth, maxHeight, preserveAspectRatio = true } = options;

  // Получаем базовые размеры
  let dimensions = normalizeForDisplay
    ? await getNormalizedImageDimensions(blob)
    : await getImageDimensionsFromBlob(blob);

  // Применяем ограничения размеров, если указаны
  if (maxWidth || maxHeight) {
    let { width, height } = dimensions;

    if (preserveAspectRatio) {
      const aspectRatio = width / height;

      if (maxWidth && width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (maxHeight && height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    } else {
      if (maxWidth && width > maxWidth) {
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        height = maxHeight;
      }
    }

    dimensions = {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  return dimensions;
}
