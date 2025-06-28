export const setColorIcons = async (tabId: number) => {
  await chrome.action.setIcon({
    tabId,
    path: {
      '16': chrome.runtime.getURL('icons/icon-16.png'),
      '32': chrome.runtime.getURL('icons/icon-32.png'),
      '48': chrome.runtime.getURL('icons/icon-48.png'),
      '128': chrome.runtime.getURL('icons/icon-128.png'),
    },
  });
};

export const setGrayscaleIcons = async (tabId: number) => {
  await chrome.action.setIcon({
    tabId,
    path: {
      '16': chrome.runtime.getURL('icons/icon-16-gray.png'),
      '32': chrome.runtime.getURL('icons/icon-32-gray.png'),
      '48': chrome.runtime.getURL('icons/icon-48-gray.png'),
      '128': chrome.runtime.getURL('icons/icon-128-gray.png'),
    },
  });
};
