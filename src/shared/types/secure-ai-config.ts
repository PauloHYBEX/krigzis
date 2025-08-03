// Declaração de tipos para ambiente renderer
declare global {
  interface Window {
    localStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
      clear(): void;
    };
  }
}

export interface SecureAIConfig {
  // Configurações do usuário (não empacotadas)
  userApiKeys: {
    openai?: string;
    gemini?: string;
    custom?: string;
  };
  
  // Configurações do sistema (empacotadas)
  systemConfig: {
    defaultProvider: 'local';
    maxRetries: number;
    timeout: number;
    enableLocalProcessing: boolean;
    dataRetentionDays: number;
  };
  
  // Configurações de segurança
  security: {
    encryptApiKeys: boolean;
    anonymizeData: boolean;
    shareUsageStatistics: boolean;
    enableTelemetry: boolean;
  };
}

export const DEFAULT_SECURE_AI_CONFIG: SecureAIConfig = {
  userApiKeys: {},
  systemConfig: {
    defaultProvider: 'local',
    maxRetries: 3,
    timeout: 30000,
    enableLocalProcessing: true,
    dataRetentionDays: 90
  },
  security: {
    encryptApiKeys: true,
    anonymizeData: true,
    shareUsageStatistics: false,
    enableTelemetry: false
  }
};

export class SecureAIConfigManager {
  private static instance: SecureAIConfigManager;
  private config: SecureAIConfig;
  private storageKey = 'krigzis-secure-ai-config';

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): SecureAIConfigManager {
    if (!SecureAIConfigManager.instance) {
      SecureAIConfigManager.instance = new SecureAIConfigManager();
    }
    return SecureAIConfigManager.instance;
  }

  private loadConfig(): SecureAIConfig {
    try {
      // Verificar se estamos no ambiente renderer (browser)
      if (typeof (globalThis as any).window !== 'undefined' && (globalThis as any).window?.localStorage) {
        const stored = (globalThis as any).window.localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SECURE_AI_CONFIG, ...parsed };
        }
      }
    } catch (error) {
      console.error('Error loading secure AI config:', error);
    }
    return DEFAULT_SECURE_AI_CONFIG;
  }

  public getConfig(): SecureAIConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SecureAIConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public setApiKey(provider: 'openai' | 'gemini' | 'custom', key: string): void {
    this.config.userApiKeys[provider] = key;
    this.saveConfig();
  }

  public getApiKey(provider: 'openai' | 'gemini' | 'custom'): string | undefined {
    return this.config.userApiKeys[provider];
  }

  public clearApiKey(provider: 'openai' | 'gemini' | 'custom'): void {
    delete this.config.userApiKeys[provider];
    this.saveConfig();
  }

  public clearAllApiKeys(): void {
    this.config.userApiKeys = {};
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      // Verificar se estamos no ambiente renderer (browser)
      if (typeof (globalThis as any).window !== 'undefined' && (globalThis as any).window?.localStorage) {
        (globalThis as any).window.localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('Error saving secure AI config:', error);
    }
  }

  public resetToDefault(): void {
    this.config = { ...DEFAULT_SECURE_AI_CONFIG };
    this.saveConfig();
  }
} 