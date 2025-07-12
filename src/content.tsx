import ReactDOM from 'react-dom/client';

import { ActionsEnum } from './consts';
import { PixelPerfectApp } from './content/PixelPerfectApp';
import { logError } from './lib/logger';
import { ctx, toggleMainMenuAction } from './store';
import styles from './styles/globals.css?inline';

let root: ReactDOM.Root | null = null;
let shadowHost: HTMLDivElement | null = null;

async function initPixelPerfect() {
  if (root) return;

  try {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Ждем готовности body
    if (!document.body) {
      await new Promise(resolve => {
        const observer = new MutationObserver(() => {
          if (document.body) {
            observer.disconnect();
            resolve(undefined);
          }
        });
        observer.observe(document.documentElement, { childList: true });
      });
    }

    // Create shadow host element
    shadowHost = document.createElement('div');
    shadowHost.id = 'pixel-perfect-shadow-host';
    shadowHost.style.cssText =
      'position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 999999; pointer-events: none;';
    document.body.appendChild(shadowHost);

    // Create shadow root for style isolation
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Create container inside shadow root
    const container = document.createElement('div');
    container.id = 'pixel-perfect-root';
    container.style.cssText =
      'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999999; font-size: 16px; line-height: 1.5; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;';

    // Create style element with bundled Tailwind CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    // Append styles and container to shadow root
    shadowRoot.appendChild(styleElement);
    shadowRoot.appendChild(container);

    // Create React root and render app
    root = ReactDOM.createRoot(container);
    root.render(<PixelPerfectApp />);
  } catch (error) {
    logError('Ошибка при инициализации:', error);
  }
}

function destroyPixelPerfect() {
  try {
    if (root) {
      root.unmount();
      root = null;
    }

    // Remove shadow host (which contains the shadow root)
    if (shadowHost) {
      shadowHost.remove();
      shadowHost = null;
    }
  } catch (error) {
    logError('Ошибка при удалении:', error);
  }
}

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPixelPerfect();
  });
} else {
  initPixelPerfect();
}

// Clean up when page unloads
window.addEventListener('beforeunload', destroyPixelPerfect);

// Глобальный обработчик сообщений
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === ActionsEnum.TOGGLE_MAIN_MENU) {
      toggleMainMenuAction(ctx);
    } else if (request.action === ActionsEnum.PING) {
      sendResponse({ status: ActionsEnum.PONG });
    }
  });
}
