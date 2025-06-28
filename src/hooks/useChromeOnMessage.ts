import { useEffect, useRef } from 'react';

type Listener = (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

export const useChromeOnMessage = (listener: Listener) => {
  const listenerRef = useRef(listener);

  // Обновляем ref при изменении listener
  listenerRef.current = listener;

  useEffect(() => {
    const stableListener = (...params: Parameters<Listener>) => listenerRef.current(...params);

    chrome.runtime.onMessage.addListener(stableListener);

    return () => {
      chrome.runtime.onMessage.removeListener(stableListener);
    };
  }, []);
};
