export const canUseExtensionOnPage = (url: string): boolean => {
  return (
    !url.startsWith('chrome://') &&
    !url.startsWith('chrome-extension://') &&
    !url.startsWith('edge://') &&
    !url.startsWith('about://')
  );
};
