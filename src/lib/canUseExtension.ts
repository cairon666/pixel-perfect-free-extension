import { checkPageAccessibility } from './checkPageAccessibility';

export const canUseExtensionOnPage = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  // Список неподдерживаемых протоколов
  const unsupportedProtocols = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'edge://',
    'about://',
    'data:',
    // eslint-disable-next-line no-script-url
    'javascript:',
    'mailto:',
    'tel:',
    'ftp://',
  ];

  // Проверяем неподдерживаемые протоколы
  if (unsupportedProtocols.some(protocol => url.startsWith(protocol))) {
    return false;
  }

  // Список неподдерживаемых доменов
  const unsupportedDomains = [
    'chrome.google.com/webstore',
    'addons.mozilla.org',
    'microsoftedge.microsoft.com',
  ];

  // Проверяем неподдерживаемые домены
  if (unsupportedDomains.some(domain => url.includes(domain))) {
    return false;
  }

  // file:// URL требуют специального разрешения - базовая поддержка есть
  if (url.startsWith('file://')) {
    return true; // Дополнительная проверка будет в checkPageAccessibility
  }

  return true;
};

export const canUseExtension = async (tabId: number, status?: string, url?: string) => {
  const isComplete = status === 'complete';
  const canUsePage = canUseExtensionOnPage(url);
  const isAccessible = await checkPageAccessibility(tabId, url);

  return isComplete && canUsePage && isAccessible;
};
