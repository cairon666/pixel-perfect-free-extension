import { STORAGE_IMAGES_KEY } from './consts';
import { canUseExtensionOnPage } from './lib/canUseExtensionOnPage';

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
});

// Функция для обновления состояния иконки
const updateIconState = (tabId: number, url: string) => {
  const canUse = canUseExtensionOnPage(url);

  if (canUse) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
};

// Слушатель изменения активной вкладки
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url) {
      updateIconState(activeInfo.tabId, tab.url);
    }
  });
});

// Слушатель обновления вкладки
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.url) {
    updateIconState(tabId, tab.url);
  }
});

// Обработчик сообщений между content script и popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Если это сообщение об обновлении состояния изображения от content script
  if (request.action === 'updateImageState' && sender.tab) {
    // Сохраняем состояние в chrome.storage
    chrome.storage.local.get([STORAGE_IMAGES_KEY], result => {
      const images = result[STORAGE_IMAGES_KEY] || [];

      const updated = images.map((img: any) => {
        if (img.dataUrl === request.src) {
          return {
            ...img,
            position: request.position,
            size: request.size,
          };
        }
        return img;
      });

      chrome.storage.local.set({ [STORAGE_IMAGES_KEY]: updated });
    });
  }

  sendResponse();
  return true;
});
