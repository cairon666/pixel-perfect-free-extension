export const checkPageAccessibility = async (tabId: number, url?: string): Promise<boolean> => {
  if (!url) {
    return false;
  }

  try {
    // Специальная обработка file:// URL - нужно проверить разрешение
    if (url.startsWith('file://')) {
      return await new Promise(resolve => {
        if (chrome.extension?.isAllowedFileSchemeAccess) {
          chrome.extension.isAllowedFileSchemeAccess(isAllowed => {
            resolve(isAllowed);
          });
        } else {
          // Если API недоступен, пробуем executeScript
          chrome.scripting.executeScript(
            {
              target: { tabId },
              func: () => true,
            },
            () => {
              resolve(!chrome.runtime.lastError);
            }
          );
        }
      });
    }

    // Для остальных URL пробуем выполнить скрипт
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => true,
    });
    return true;
  } catch (error) {
    return false;
  }
};
