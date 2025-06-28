import { useEffect, useRef } from 'react';

export const useOnStorageChange = (
  listener: (changes: { [key: string]: chrome.storage.StorageChange }) => void
) => {
  const listenerRef = useRef(listener);

  listenerRef.current = listener;

  useEffect(() => {
    const stableListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      listenerRef.current(changes);
    };

    chrome.storage.onChanged.addListener(stableListener);

    return () => {
      chrome.storage.onChanged.removeListener(stableListener);
    };
  }, []);
};
