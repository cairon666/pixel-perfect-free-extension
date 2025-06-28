import { ActionsEnum } from './consts';
import { canUseExtension } from './lib/canUseExtension';
import { getCurrentActiveTab } from './lib/getCurrentActiveTab';
import { setGrayscaleIcons, setColorIcons } from './lib/icons';
import { logError } from './lib/logger';

const updateIconState = async (tabId: number, url?: string, status?: string) => {
  const isCanUse = await canUseExtension(tabId, status, url);

  const onError = async () => {
    await setGrayscaleIcons(tabId);
    await chrome.action.setTitle({
      tabId,
      title: 'Pixel Perfect - Недоступно на этой странице',
    });
  };

  try {
    if (isCanUse) {
      await setColorIcons(tabId);
      await chrome.action.setTitle({
        tabId,
        title: 'Pixel Perfect - Нажмите для открытия',
      });
    } else {
      await onError();
    }
  } catch (error) {
    await onError();
  }
};

const onInitExtension = async () => {
  try {
    const activeTab = await getCurrentActiveTab();

    if (activeTab?.url && activeTab?.id) {
      await setGrayscaleIcons(activeTab.id);
      await updateIconState(activeTab.id, activeTab.url, activeTab.status);
    }
  } catch (error) {
    logError('Failed to initialize extension state:', error);
  }
};

const ensureContentScriptAndSend = async (tabId: number) => {
  try {
    // Сначала попробуем ping
    await chrome.tabs.sendMessage(tabId, { action: ActionsEnum.PING });
  } catch (error) {
    try {
      // Внедряем content script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/content.js'],
      });
    } catch (injectError) {
      logError('Failed to inject content script', injectError);
      throw injectError;
    }
  }

  await chrome.tabs.sendMessage(tabId, {
    action: ActionsEnum.TOGGLE_MAIN_MENU,
  });
};

chrome.runtime.onInstalled.addListener(() => {
  onInitExtension();
});

chrome.runtime.onStartup.addListener(() => {
  onInitExtension();
});

chrome.action.onClicked.addListener(async tab => {
  if (!tab.id) {
    return;
  }

  const isCanUse = await canUseExtension(tab.id, tab.status, tab.url);

  if (!isCanUse) {
    return;
  }

  try {
    await ensureContentScriptAndSend(tab.id);
  } catch (error) {
    logError('Failed to open menu', error);
  }
});

chrome.tabs.onActivated.addListener(async activeInfo => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await updateIconState(activeInfo.tabId, tab.url, tab.status);
    }
  } catch (error) {
    logError('Failed to update icon on tab activation:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    const status = changeInfo.status || tab.status;

    if (changeInfo.url) {
      await updateIconState(tabId, tab.url, 'loading');
    } else if (changeInfo.status) {
      await updateIconState(tabId, tab.url, status);
    }
  } catch (error) {
    logError('Failed to update icon on tab update:', error);
  }
});
