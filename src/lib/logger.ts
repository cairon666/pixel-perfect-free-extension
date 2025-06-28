export const logError = (...message: any[]) => {
  console.error(`[PixelPerfect]: ${message.join(' ')}`);
};

export const logInfo = (...message: any[]) => {
  // eslint-disable-next-line no-console
  console.log(`[PixelPerfect]: ${message.join(' ')}`);
};

export const logWarn = (...message: any[]) => {
  console.warn(`[PixelPerfect]: ${message.join(' ')}`);
};
