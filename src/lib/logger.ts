export const logError = (...message: any[]) => {
  console.error(`[PixelPerfect]: ${message.join(' ')}`);
};

export const logInfo = (...message: any[]) => {
  console.log(`[PixelPerfect]: ${message.join(' ')}`);
};
