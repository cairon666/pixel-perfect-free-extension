// Mock Chrome API for tests
global.chrome = {
  storage: {
    local: {
      get: (keys: string[] | string, callback: (result: any) => void) => {
        // Mock empty storage
        callback({});
      },
      set: (items: Record<string, any>, callback?: () => void) => {
        if (callback) callback();
      },
    },
    sync: {
      get: (keys: string[] | string, callback: (result: any) => void) => {
        callback({});
      },
      set: (items: Record<string, any>, callback?: () => void) => {
        if (callback) callback();
      },
    },
    onChanged: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  runtime: {
    sendMessage: () => {},
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  tabs: {
    query: () => {},
    sendMessage: () => {},
  },
} as any;
