import React, { useState, useEffect, useContext, createContext } from 'react';
import { Language } from './useI18n';

export interface TaskStatusCard {
  id: string;
  key: string;
  title: string;
  description: string;
  accentColor: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface QuickAction {
  key: string;
  enabled: boolean;
  order: number;
}

export interface UserSettings {
  // Personal
  userName: string;
  language: Language;
  
  // Appearance
  theme: 'dark' | 'light' | 'system';
  
  // System
  startWithOS: boolean;
  minimizeToTray: boolean;
  
  // Notifications
  showNotifications: boolean;
  playSound: boolean;
  
  // Productivity
  dailyGoal: number;
  autoSave: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';

  // Accessibility  
  showTimer: boolean;
  showReports: boolean;
  showNotes: boolean;
  showQuickActions: boolean;
  highContrastMode: boolean;
  largeFontMode: boolean;
  showTaskCounters: boolean;

  // Data Management
  dataPath?: string;

  // AI Behavior Settings
  aiCanCreateTasks: boolean;
  aiCanEditTasks: boolean;
  aiCanDeleteTasks: boolean;
  aiCanManageNotes: boolean;
  aiResponseMode: 'detailed' | 'balanced' | 'concise';
  aiProactiveMode: boolean;
  
  // Productivity Settings
  showProductivityTips: boolean;
  showProgressInsights: boolean;

  // Task Cards
  taskCards: TaskStatusCard[];

  // Quick Actions
  quickActions: QuickAction[];

  // Tab ordering
  tabOrder: string[];
}

export interface SystemInfo {
  machineId: string;
  installDate: string;
  version: string;
  lastUpdate: string;
}

export interface SessionInfo {
  isHost: boolean;
  isConnected: boolean;
  sessionId?: string;
  hostId?: string;
}

const DEFAULT_TASK_CARDS: TaskStatusCard[] = [
  {
    id: 'backlog',
    key: 'backlog',
    title: 'Backlog',
    description: 'Tarefas planejadas',
    accentColor: '#6B7280',
    icon: 'ClipboardList',
    enabled: true,
    order: 1
  },
  {
    id: 'esta_semana',
    key: 'esta_semana',
    title: 'Esta Semana',
    description: 'Foco da semana',
    accentColor: '#3B82F6',
    icon: 'CalendarDays',
    enabled: true,
    order: 2
  },
  {
    id: 'hoje',
    key: 'hoje',
    title: 'Hoje',
    description: 'Prioridade máxima',
    accentColor: '#F59E0B',
    icon: 'Zap',
    enabled: true,
    order: 3
  },
  {
    id: 'concluido',
    key: 'concluido',
    title: 'Concluído',
    description: 'Tarefas finalizadas',
    accentColor: '#10B981',
    icon: 'CheckCircle',
    enabled: true,
    order: 4
  }
];

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { key: 'timer', enabled: true, order: 1 },
  { key: 'reports', enabled: true, order: 2 },
  { key: 'newTask', enabled: true, order: 3 },
  { key: 'categories', enabled: false, order: 4 },
  { key: 'backup', enabled: false, order: 5 },
  { key: 'import', enabled: false, order: 6 },
  { key: 'clearData', enabled: false, order: 7 },
  { key: 'profile', enabled: false, order: 8 },
  { key: 'share', enabled: false, order: 9 },
  { key: 'logout', enabled: false, order: 10 },
  { key: 'notes', enabled: true, order: 11 },
  { key: 'newNote', enabled: false, order: 12 },
  { key: 'settings', enabled: false, order: 13 },
];

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Paulo',
  language: 'pt-BR',
  theme: 'dark',
  startWithOS: false,
  minimizeToTray: true,
  showNotifications: true,
  playSound: true,
  dailyGoal: 5,
  autoSave: true,
  autoBackup: true,
  backupFrequency: 'daily',
  showTimer: true,
  showReports: true,
  showNotes: true,
  showQuickActions: true,
  highContrastMode: false,
  largeFontMode: false,
  showTaskCounters: true,
  
  // AI Behavior Settings
  aiCanCreateTasks: true,
  aiCanEditTasks: true,
  aiCanDeleteTasks: false,
  aiCanManageNotes: true,
  aiResponseMode: 'balanced',
  aiProactiveMode: false,
  
  // Productivity Settings
  showProductivityTips: true,
  showProgressInsights: true,
  
  taskCards: DEFAULT_TASK_CARDS,
  quickActions: DEFAULT_QUICK_ACTIONS,
  tabOrder: ['dashboard', 'notes', 'reports'], // Ordem padrão das abas
};

const SETTINGS_STORAGE_KEY = 'krigzis-user-settings';
const SYSTEM_INFO_STORAGE_KEY = 'krigzis-system-info';
const SESSION_INFO_STORAGE_KEY = 'krigzis-session-info';

// Generate unique machine ID
const generateMachineId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const navigatorInfo = navigator.userAgent.replace(/\s+/g, '').substring(0, 10);
  const screenInfo = `${screen.width}x${screen.height}`;
  
  const combined = `${timestamp}-${randomPart}-${navigatorInfo}-${screenInfo}`;
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `KRG-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0')}`;
};

interface SettingsContextType {
  settings: UserSettings;
  settingsVersion: number;
  systemInfo: SystemInfo | null;
  sessionInfo: SessionInfo;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  clearAllData: () => Promise<boolean>;
  updateSessionInfo: (newSessionInfo: Partial<SessionInfo>) => void;
  exportSettings: () => string;
  importSettings: (jsonData: string) => boolean;
  getGreeting: () => string;
  updateTaskCard: (cardId: string, updates: Partial<TaskStatusCard>) => void;
  addTaskCard: (newCard: Omit<TaskStatusCard, 'id' | 'order'>) => void;
  removeTaskCard: (cardId: string) => void;
  reorderTaskCards: (cardIds: string[]) => void;
  resetTaskCards: () => void;
  getEnabledTaskCards: () => TaskStatusCard[];
  getEnabledQuickActions: () => QuickAction[];
  updateQuickActions: (actions: QuickAction[]) => void;
  enableQuickAction: (key: string) => void;
  disableQuickAction: (key: string) => void;
  reorderQuickActions: (orderedKeys: string[]) => void;
  updateTabOrder: (newOrder: string[]) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isHost: true,
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings and system info on mount
  useEffect(() => {
    loadSettings();
    loadSystemInfo();
    loadSessionInfo();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        
        // Migração: Adicionar novas ações rápidas se não existirem
        const migratedQuickActions = migrateQuickActions(parsedSettings.quickActions || []);
        
        const updatedSettings = { 
          ...DEFAULT_SETTINGS, 
          ...parsedSettings,
          quickActions: migratedQuickActions
        };
        
        setSettings(updatedSettings);
        
        // Salvar as configurações migradas
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para migrar ações rápidas
  const migrateQuickActions = (existingActions: QuickAction[]): QuickAction[] => {
    const allNewActions = DEFAULT_QUICK_ACTIONS;
    const existingKeys = existingActions.map(action => action.key);
    
    // Manter ações existentes
    const migratedActions = [...existingActions];
    
    // Adicionar novas ações que não existem
    allNewActions.forEach(newAction => {
      if (!existingKeys.includes(newAction.key)) {
        migratedActions.push(newAction);
      }
    });
    
    // Reordenar para manter consistência
    return migratedActions.sort((a, b) => a.order - b.order);
  };

  const loadSystemInfo = () => {
    try {
      let storedSystemInfo = localStorage.getItem(SYSTEM_INFO_STORAGE_KEY);
      
      if (!storedSystemInfo) {
        // First time setup - generate system info
        const newSystemInfo: SystemInfo = {
          machineId: generateMachineId(),
          installDate: new Date().toISOString(),
          version: '1.0.0',
          lastUpdate: new Date().toISOString(),
        };
        
        localStorage.setItem(SYSTEM_INFO_STORAGE_KEY, JSON.stringify(newSystemInfo));
        setSystemInfo(newSystemInfo);
      } else {
        const parsedSystemInfo = JSON.parse(storedSystemInfo);
        // Update last update time
        parsedSystemInfo.lastUpdate = new Date().toISOString();
        localStorage.setItem(SYSTEM_INFO_STORAGE_KEY, JSON.stringify(parsedSystemInfo));
        setSystemInfo(parsedSystemInfo);
      }
    } catch (error) {
      console.error('Error loading system info:', error);
      // Fallback system info
      const fallbackSystemInfo: SystemInfo = {
        machineId: generateMachineId(),
        installDate: new Date().toISOString(),
        version: '1.0.0',
        lastUpdate: new Date().toISOString(),
      };
      setSystemInfo(fallbackSystemInfo);
    }
  };

  const loadSessionInfo = () => {
    try {
      const stored = localStorage.getItem(SESSION_INFO_STORAGE_KEY);
      if (stored) {
        const parsedSessionInfo = JSON.parse(stored);
        setSessionInfo(parsedSessionInfo);
      }
    } catch (error) {
      console.error('Error loading session info:', error);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setSettingsVersion(v => v + 1);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const clearAllData = async (): Promise<boolean> => {
    try {
      // Clear localStorage data
      const keysToKeep = [SYSTEM_INFO_STORAGE_KEY]; // Keep system info (machine ID)
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (key.startsWith('krigzis-') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Reset to default settings
      setSettings(DEFAULT_SETTINGS);
      setSessionInfo({ isHost: true, isConnected: false });

      // Clear database via window API if available
      if ((window as any).electronAPI?.tasks?.clearAll) {
        await (window as any).electronAPI.tasks.clearAll();
      }

      // Save default settings
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  };

  const updateSessionInfo = (newSessionInfo: Partial<SessionInfo>) => {
    const updatedSessionInfo = { ...sessionInfo, ...newSessionInfo };
    setSessionInfo(updatedSessionInfo);
    
    try {
      localStorage.setItem(SESSION_INFO_STORAGE_KEY, JSON.stringify(updatedSessionInfo));
    } catch (error) {
      console.error('Error saving session info:', error);
    }
  };

  const exportSettings = (): string => {
    const exportData = {
      settings,
      systemInfo,
      sessionInfo,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importSettings = (jsonData: string): boolean => {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.settings) {
        updateSettings(importData.settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  // Dynamic greeting based on time and language
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    let greetingKey = 'greeting.morning';
    
    if (hour >= 12 && hour < 18) {
      greetingKey = 'greeting.afternoon';
    } else if (hour >= 18) {
      greetingKey = 'greeting.evening';
    }
    
    return greetingKey;
  };

  // Task Cards Management
  const updateTaskCard = (cardId: string, updates: Partial<TaskStatusCard>) => {
    const updatedCards = settings.taskCards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    updateSettings({ taskCards: updatedCards });
  };

  const addTaskCard = (newCard: Omit<TaskStatusCard, 'id' | 'order'>) => {
    const maxOrder = Math.max(...settings.taskCards.map(c => c.order), 0);
    const cardWithId: TaskStatusCard = {
      ...newCard,
      id: `custom-${Date.now()}`,
      order: maxOrder + 1
    };
    updateSettings({ taskCards: [...settings.taskCards, cardWithId] });
  };

  const removeTaskCard = (cardId: string) => {
    const updatedCards = settings.taskCards.filter(card => card.id !== cardId);
    updateSettings({ taskCards: updatedCards });
  };

  const reorderTaskCards = (cardIds: string[]) => {
    const reorderedCards = cardIds.map((id, index) => {
      const card = settings.taskCards.find(c => c.id === id);
      return card ? { ...card, order: index + 1 } : null;
    }).filter(Boolean) as TaskStatusCard[];
    
    updateSettings({ taskCards: reorderedCards });
  };

  const resetTaskCards = () => {
    updateSettings({ taskCards: DEFAULT_TASK_CARDS });
  };

  const getEnabledTaskCards = () => {
    return settings.taskCards
      .filter(card => card.enabled)
      .sort((a, b) => a.order - b.order);
  };

  // Quick Actions Management
  const getEnabledQuickActions = () => {
    return settings.quickActions
      .filter(a => a.enabled)
      .sort((a, b) => a.order - b.order);
  };

  const updateQuickActions = (actions: QuickAction[]) => {
    updateSettings({ quickActions: actions });
  };

  const enableQuickAction = (key: string) => {
    const updated = settings.quickActions.map(a => 
      a.key === key ? { ...a, enabled: true } : a
    );
    updateQuickActions(updated);
  };

  const disableQuickAction = (key: string) => {
    const updated = settings.quickActions.map(a => 
      a.key === key ? { ...a, enabled: false } : a
    );
    updateQuickActions(updated);
  };

  const reorderQuickActions = (orderedKeys: string[]) => {
    const updated = [...settings.quickActions];
    orderedKeys.forEach((key, idx) => {
      const action = updated.find(a => a.key === key);
      if (action) action.order = idx + 1;
    });
    updateQuickActions(updated);
  };

  const updateTabOrder = (newOrder: string[]) => {
    updateSettings({ tabOrder: newOrder });
  };

  const contextValue: SettingsContextType = {
    settings,
    settingsVersion,
    systemInfo,
    sessionInfo,
    isLoading,
    updateSettings,
    resetSettings,
    clearAllData,
    updateSessionInfo,
    exportSettings,
    importSettings,
    getGreeting,
    updateTaskCard,
    addTaskCard,
    removeTaskCard,
    reorderTaskCards,
    resetTaskCards,
    getEnabledTaskCards,
    getEnabledQuickActions,
    updateQuickActions,
    enableQuickAction,
    disableQuickAction,
    reorderQuickActions,
    updateTabOrder,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 