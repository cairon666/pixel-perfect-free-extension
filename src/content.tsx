import ReactDOM from 'react-dom/client';

import { ActionsEnum } from './consts';
import { PixelPerfectApp } from './content/PixelPerfectApp';
import { ReatomProvider, ctx, showOverlay, hideOverlay, setMainMenuVisible, toggleMainMenu } from './store';
import tailwindStyles from './styles/globals.css?inline';

let root: ReactDOM.Root | null = null;
let shadowHost: HTMLDivElement | null = null;

// Глобальный обработчик сообщений (работает всегда)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case ActionsEnum.PING:
        sendResponse({ status: ActionsEnum.PONG });
        return true;

      case ActionsEnum.SHOW_OVERLAY:
        if (request.src && request.imageId) {
          showOverlay(ctx, request.src, request.imageId, request.position, request.size);
        }
        sendResponse({ status: ActionsEnum.SUCCESS });
        return true;

      case ActionsEnum.HIDE_OVERLAY:
        hideOverlay(ctx);
        sendResponse({ status: ActionsEnum.SUCCESS });
        return true;

      case ActionsEnum.OPEN_IMAGE_PANEL:
        setMainMenuVisible(ctx, true);
        sendResponse({ status: ActionsEnum.SUCCESS });
        return true;

      case ActionsEnum.TOGGLE_MAIN_MENU:
        toggleMainMenu(ctx);
        sendResponse({ status: ActionsEnum.SUCCESS });
        return true;

      default:
        sendResponse({ status: ActionsEnum.UNKNOWN_ACTION });
        return true;
    }
  });
}

async function initPixelPerfect() {
  if (root) return;

  try {
    // Ждем готовности DOM
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
      'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999999;';

    // Create style element with bundled Tailwind CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = tailwindStyles;

    // Append styles and container to shadow root
    shadowRoot.appendChild(styleElement);
    shadowRoot.appendChild(container);

    // Create React root and render app
    root = ReactDOM.createRoot(container);
    root.render(
      <ReatomProvider value={ctx}>
        <PixelPerfectApp />
      </ReatomProvider>
    );
  } catch (error) {
    console.error('Ошибка при инициализации Pixel Perfect:', error);
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
    console.error('Ошибка при удалении Pixel Perfect:', error);
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
