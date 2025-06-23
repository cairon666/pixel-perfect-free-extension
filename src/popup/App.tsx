import { useEffect, useState } from 'react';
import { canUseExtensionOnPage } from 'src/lib/canUseExtensionOnPage';

import { Main } from './components/Main';
import { UnsupportedPage } from './components/UnsupportedPage';

export function App() {
  const [isPageSupported, setIsPageSupported] = useState<boolean>(true);

  // Check if current page supports extension
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentTab = tabs[0];
      if (currentTab?.url) {
        setIsPageSupported(canUseExtensionOnPage(currentTab.url));
      }
    });
  }, []);

  // Если страница не поддерживается - показываем сообщение
  if (!isPageSupported) {
    return <UnsupportedPage />;
  }

  return <Main />;
}
