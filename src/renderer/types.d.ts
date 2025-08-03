declare global {
  interface Window {
    electronAPI?: {
      database: {
        create: (data: any) => Promise<any>;
        read: (query: any) => Promise<any>;
        update: (data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
      };
      settings: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<any>;
      };
      system: {
        platform: string;
        version: string;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
      openDevTools?: () => void;
      toggleDevTools?: () => void;
    };
  }
}

export {}; 