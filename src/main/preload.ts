import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // New Task operations
  tasks: {
    getAll: () => Promise<any>;
    getByStatus: (status: string) => Promise<any>;
    create: (taskData: any) => Promise<any>;
    update: (id: number, updates: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    getStats: () => Promise<any>;
    clearAll: () => Promise<any>;
  };

  // Database operations (includes tasks and notes)
  database: {
    // Task methods
    getAllTasks: () => Promise<any>;
    getTasksByStatus: (status: string) => Promise<any>;
    createTask: (taskData: any) => Promise<any>;
    updateTask: (id: number, updates: any) => Promise<any>;
    deleteTask: (id: number) => Promise<any>;
    getTaskStats: () => Promise<any>;
    
    // Note methods
    getAllNotes: () => Promise<any>;
    getNoteById: (id: number) => Promise<any>;
    createNote: (noteData: any) => Promise<any>;
    updateNote: (id: number, updates: any) => Promise<any>;
    deleteNote: (id: number) => Promise<any>;
    getNoteStats: () => Promise<any>;
    linkNoteToTask: (noteId: number, taskId: number) => Promise<any>;
    unlinkNoteFromTask: (noteId: number) => Promise<any>;
    
    // Novos métodos para vincular task->note
    linkTaskToNote: (taskId: number, noteId: number) => Promise<any>;
    unlinkTaskFromNote: (taskId: number) => Promise<any>;
    
    // Legacy methods (for compatibility)
    create: (data: any) => Promise<any>;
    read: (query: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  
  // Settings operations
  settings: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
  };
  
  // Logging operations
  logging: {
    logAction: (data: any) => Promise<any>;
    logTaskCreation: (userId: string, taskId: number, taskTitle: string) => Promise<any>;
    logTaskUpdate: (userId: string, taskId: number, changes: any) => Promise<any>;
    logTaskDeletion: (userId: string, taskId: number, taskTitle: string) => Promise<any>;
    logCategoryCreation: (userId: string, categoryId: number, categoryName: string) => Promise<any>;
    logCategoryUpdate: (userId: string, categoryId: number, changes: any) => Promise<any>;
    logCategoryDeletion: (userId: string, categoryId: number, categoryName: string) => Promise<any>;
    logAIAction: (userId: string, action: string, provider: string, success: boolean, details?: any) => Promise<any>;
    logSettingsChange: (userId: string, setting: string, oldValue: any, newValue: any) => Promise<any>;
    logError: (userId: string, error: Error, context: string) => Promise<any>;
    
    // Métodos para recuperar logs
    getLogs: (options?: { level?: string; category?: string; limit?: number; offset?: number }) => Promise<any[]>;
    getCrashReports: (options?: { limit?: number; offset?: number }) => Promise<any[]>;
    getLogStats: () => Promise<any>;
    clearLogs: (olderThan?: Date) => Promise<number>;
    exportLogs: (options?: { level?: string; category?: string; startDate?: Date; endDate?: Date }) => Promise<string>;
  };
  
  // Version and update operations
  version: {
    getCurrentVersion: () => Promise<any>;
    getUpdateSettings: () => Promise<any>;
    updateSettings: (settings: any) => Promise<any>;
    checkForUpdates: (force?: boolean) => Promise<any>;
    getUpdateStatus: () => Promise<any>;
    isCheckingForUpdates: () => Promise<boolean>;
    forceCheck: () => Promise<any>;
  };

  // Update download operations
  update: {
    download: (updateInfo: any) => Promise<any>;
    cancelDownload: () => Promise<any>;
    isDownloading: () => Promise<boolean>;
    cleanupOldDownloads: (keepLast?: number) => Promise<any>;
  };
  
  // System operations
  system: {
    platform: string;
    version: string;
  };

  // Generic invoke method for flexibility
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // New Task operations
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    getByStatus: (status: string) => ipcRenderer.invoke('tasks:getByStatus', status),
    create: (taskData: any) => ipcRenderer.invoke('tasks:create', taskData),
    update: (id: number, updates: any) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id: number) => ipcRenderer.invoke('tasks:delete', id),
    getStats: () => ipcRenderer.invoke('tasks:getStats'),
    clearAll: () => ipcRenderer.invoke('tasks:clearAll'),
  },

  // Database operations (includes tasks and notes)
  database: {
    // Task methods
    getAllTasks: () => ipcRenderer.invoke('database:getAllTasks'),
    getTasksByStatus: (status: string) => ipcRenderer.invoke('database:getTasksByStatus', status),
    createTask: (taskData: any) => ipcRenderer.invoke('database:createTask', taskData),
    updateTask: (id: number, updates: any) => ipcRenderer.invoke('database:updateTask', id, updates),
    deleteTask: (id: number) => ipcRenderer.invoke('database:deleteTask', id),
    getTaskStats: () => ipcRenderer.invoke('database:getTaskStats'),
    
    // Note methods
    getAllNotes: () => ipcRenderer.invoke('database:getAllNotes'),
    getNoteById: (id: number) => ipcRenderer.invoke('database:getNoteById', id),
    createNote: (noteData: any) => ipcRenderer.invoke('database:createNote', noteData),
    updateNote: (id: number, updates: any) => ipcRenderer.invoke('database:updateNote', id, updates),
    deleteNote: (id: number) => ipcRenderer.invoke('database:deleteNote', id),
    getNoteStats: () => ipcRenderer.invoke('database:getNoteStats'),
    linkNoteToTask: (noteId: number, taskId: number) => ipcRenderer.invoke('database:linkNoteToTask', noteId, taskId),
    unlinkNoteFromTask: (noteId: number) => ipcRenderer.invoke('database:unlinkNoteFromTask', noteId),
    
    // Novos métodos para vincular task->note
    linkTaskToNote: (taskId: number, noteId: number) => ipcRenderer.invoke('database:linkTaskToNote', taskId, noteId),
    unlinkTaskFromNote: (taskId: number) => ipcRenderer.invoke('database:unlinkTaskFromNote', taskId),
    
    // Legacy methods (for compatibility)
    create: (data: any) => ipcRenderer.invoke('database:create', data),
    read: (query: any) => ipcRenderer.invoke('database:read', query),
    update: (data: any) => ipcRenderer.invoke('database:update', data),
    delete: (id: string) => ipcRenderer.invoke('database:delete', id),
  },
  
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
  },
  
  logging: {
    logAction: (data: any) => ipcRenderer.invoke('logging:logAction', data),
    logTaskCreation: (userId: string, taskId: number, taskTitle: string) => ipcRenderer.invoke('logging:logTaskCreation', userId, taskId, taskTitle),
    logTaskUpdate: (userId: string, taskId: number, changes: any) => ipcRenderer.invoke('logging:logTaskUpdate', userId, taskId, changes),
    logTaskDeletion: (userId: string, taskId: number, taskTitle: string) => ipcRenderer.invoke('logging:logTaskDeletion', userId, taskId, taskTitle),
    logCategoryCreation: (userId: string, categoryId: number, categoryName: string) => ipcRenderer.invoke('logging:logCategoryCreation', userId, categoryId, categoryName),
    logCategoryUpdate: (userId: string, categoryId: number, changes: any) => ipcRenderer.invoke('logging:logCategoryUpdate', userId, categoryId, changes),
    logCategoryDeletion: (userId: string, categoryId: number, categoryName: string) => ipcRenderer.invoke('logging:logCategoryDeletion', userId, categoryId, categoryName),
    logAIAction: (userId: string, action: string, provider: string, success: boolean, details?: any) => ipcRenderer.invoke('logging:logAIAction', userId, action, provider, success, details),
    logSettingsChange: (userId: string, setting: string, oldValue: any, newValue: any) => ipcRenderer.invoke('logging:logSettingsChange', userId, setting, oldValue, newValue),
    
    // Métodos para recuperar logs
    getLogs: (options?: { level?: string; category?: string; limit?: number; offset?: number }) => ipcRenderer.invoke('logging:getLogs', options),
    getCrashReports: (options?: { limit?: number; offset?: number }) => ipcRenderer.invoke('logging:getCrashReports', options),
    getLogStats: () => ipcRenderer.invoke('logging:getLogStats'),
    clearLogs: (olderThan?: Date) => ipcRenderer.invoke('logging:clearLogs', olderThan),
    exportLogs: (options?: { level?: string; category?: string; startDate?: Date; endDate?: Date }) => ipcRenderer.invoke('logging:exportLogs', options),
    logError: (userId: string, error: Error, context: string) => ipcRenderer.invoke('logging:logError', userId, error.message, error.stack, context),
  },
  
  // Version and update operations
  version: {
    getCurrentVersion: () => ipcRenderer.invoke('version:getCurrentVersion'),
    getUpdateSettings: () => ipcRenderer.invoke('version:getUpdateSettings'),
    updateSettings: (settings: any) => ipcRenderer.invoke('version:updateSettings', settings),
    checkForUpdates: (force?: boolean) => ipcRenderer.invoke('version:checkForUpdates', force),
    getUpdateStatus: () => ipcRenderer.invoke('version:getUpdateStatus'),
    isCheckingForUpdates: () => ipcRenderer.invoke('version:isCheckingForUpdates'),
    forceCheck: () => ipcRenderer.invoke('version:forceCheck'),
  },
  
  // Update download operations
  update: {
    download: (updateInfo: any) => ipcRenderer.invoke('update:download', updateInfo),
    cancelDownload: () => ipcRenderer.invoke('update:cancelDownload'),
    isDownloading: () => ipcRenderer.invoke('update:isDownloading'),
    cleanupOldDownloads: (keepLast?: number) => ipcRenderer.invoke('update:cleanupOldDownloads', keepLast),
  },
  
  system: {
    platform: process.platform,
    version: ipcRenderer.sendSync('app:getVersion'),
  },

  // Generic invoke method
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  
  on: (channel: string, callback: (...args: any[]) => void) => {
    // Whitelist channels for security
    const validChannels = [
      'menu-new-task',
      'task-created',
      'task-updated',
      'task-deleted',
      'timer-tick',
      'notification-show'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts file)
  window.electronAPI = electronAPI;
} 