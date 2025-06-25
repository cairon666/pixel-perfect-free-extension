import { STORAGE_IMAGES_KEY, ActionsEnum } from './consts';
import { canUseExtensionOnPage } from './lib/canUseExtensionOnPage';

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
});

// Обработчик клика на иконку расширения
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) {
    return;
  }

  // Проверяем, можно ли использовать расширение на этой странице
  if (!canUseExtensionOnPage(tab.url)) {
    return;
  }

  try {
    // Функция для внедрения content script и отправки сообщения
    const ensureContentScriptAndSend = async () => {
      try {
        // Сначала попробуем ping
        await chrome.tabs.sendMessage(tab.id!, { action: ActionsEnum.PING });
      } catch (error) {
        try {
          // Внедряем content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ['src/content.js'],
          });
          // Ждём немного для инициализации
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (injectError) {
          console.error('Failed to inject content script', injectError);
          throw injectError;
        }
      }

      // Отправляем сообщение для переключения главного меню
      await chrome.tabs.sendMessage(tab.id!, {
        action: ActionsEnum.TOGGLE_MAIN_MENU,
      });
    };

    await ensureContentScriptAndSend();
  } catch (error) {
    console.error('Failed to open image panel', error);
  }
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
        if (img.id === request.imageId) {
          return {
            ...img,
            position: request.position,
            size: request.size,
          };
        }
        return img;
      });
    });
  }

  sendResponse();
  return true;
});
