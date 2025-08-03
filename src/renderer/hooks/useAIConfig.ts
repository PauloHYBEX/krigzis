import { useState, useEffect, useCallback } from 'react';
import { 
  AIConfiguration, 
  AIProvider, 
  AIProviderPreset,
  DEFAULT_AI_CONFIG,
  AI_PROVIDERS,
  AI_PRESETS
} from '../../shared/types/ai-config';

const AI_CONFIG_STORAGE_KEY = 'krigzis-ai-config';

export const useAIConfig = () => {
  const [aiConfig, setAIConfig] = useState<AIConfiguration>(DEFAULT_AI_CONFIG);
  const [aiConfigVersion, setAiConfigVersion] = useState(0); // Added version tracking like settings
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configuração do localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setAIConfig({ ...DEFAULT_AI_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
      setError('Erro ao carregar configuração de IA');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configuração no localStorage
  const saveConfig = useCallback((config: AIConfiguration) => {
    try {
      const configToSave = {
        ...config,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
      setAIConfig(configToSave);
      setAiConfigVersion(v => v + 1); // Increment version like settings
      setError(null);
      
      // Trigger storage event for real-time updates across components
      window.dispatchEvent(new StorageEvent('storage', {
        key: AI_CONFIG_STORAGE_KEY,
        newValue: JSON.stringify(configToSave),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving AI config:', error);
      setError('Erro ao salvar configuração de IA');
    }
  }, []);

  // Atualizar configuração
  const updateConfig = useCallback((updates: Partial<AIConfiguration>) => {
    const newConfig = { ...aiConfig, ...updates };
    saveConfig(newConfig);
  }, [aiConfig, saveConfig]);

  // Aplicar preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = AI_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const newConfig = { ...aiConfig, ...preset.configuration };
      saveConfig(newConfig);
    }
  }, [aiConfig, saveConfig]);

  // Resetar para configuração padrão
  const resetToDefault = useCallback(() => {
    const defaultConfig = {
      ...DEFAULT_AI_CONFIG,
      userId: aiConfig.userId, // Manter userId
      createdAt: aiConfig.createdAt, // Manter data de criação
    };
    saveConfig(defaultConfig);
  }, [aiConfig.userId, aiConfig.createdAt, saveConfig]);

  // Validar configuração de API
  const validateApiConfig = useCallback(async (provider: string, apiKey?: string, apiUrl?: string): Promise<boolean> => {
    if (provider === 'local') {
      return true; // IA local não precisa validação
    }

    if (provider === 'openai') {
      if (!apiKey) {
        setError('API Key é obrigatória para OpenAI');
        return false;
      }
      
      try {
        // Testar conexão com API da OpenAI
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('API Key inválida ou expirada');
          } else if (response.status === 403) {
            setError('API Key sem permissão de acesso');
          } else if (response.status === 429) {
            setError('Limite de taxa excedido - tente novamente mais tarde');
          } else {
            setError(`Erro na API: ${response.status} ${response.statusText}`);
          }
          return false;
        }
        
        setError(null);
        return true;
      } catch (error) {
        setError('Erro ao conectar com a API da OpenAI. Verifique sua conexão de internet.');
        return false;
      }
    }

    if (provider === 'gemini') {
      if (!apiKey) {
        setError('API Key é obrigatória para Google Gemini');
        return false;
      }
      
      try {
        // Testar conexão com API do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 400) {
            setError('API Key inválida para Google Gemini');
          } else if (response.status === 403) {
            setError('API Key sem permissão ou serviço não habilitado');
          } else if (response.status === 429) {
            setError('Limite de taxa excedido - tente novamente mais tarde');
          } else {
            setError(`Erro na API Gemini: ${response.status} ${response.statusText}`);
          }
          return false;
        }
        
        setError(null);
        return true;
      } catch (error) {
        setError('Erro ao conectar com a API do Google Gemini. Verifique sua conexão de internet.');
        return false;
      }
    }

    if (provider === 'custom') {
      if (!apiUrl) {
        setError('URL da API é obrigatória para API personalizada');
        return false;
      }
      
      // Validar formato da URL
      try {
        new URL(apiUrl);
      } catch (error) {
        setError('URL da API é inválida. Use o formato: https://exemplo.com/api');
        return false;
      }
      
      try {
        // Tentar múltiplos endpoints comuns para APIs personalizadas
        const endpoints = [
          '/health',
          '/status',
          '/ping',
          '/v1/models',
          '/models',
          '/'
        ];
        
        let lastError = '';
        for (const endpoint of endpoints) {
          try {
            const testUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) + endpoint : apiUrl + endpoint;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
            
            const response = await fetch(testUrl, {
          method: 'GET',
          headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
              signal: controller.signal,
        });
            
            clearTimeout(timeoutId);
        
            if (response.ok) {
              setError(null);
              return true;
            } else if (response.status === 401 && !apiKey) {
              setError('API Key pode ser necessária para esta API personalizada');
              return false;
            } else if (response.status === 401 && apiKey) {
              setError('API Key inválida para esta API personalizada');
          return false;
        }
        
            lastError = `${response.status} ${response.statusText}`;
          } catch (endpointError) {
            lastError = 'Erro de conexão';
          }
        }
        
        setError(`Não foi possível conectar com a API personalizada. Último erro: ${lastError}`);
        return false;
      } catch (error) {
        setError('Erro ao conectar com a API personalizada. Verifique a URL e sua conexão.');
        return false;
      }
    }

    setError('Provedor de IA não suportado');
    return false;
  }, []);

  // Obter provedor atual
  const getCurrentProvider = useCallback((): AIProvider | undefined => {
    return AI_PROVIDERS.find(p => p.id === aiConfig.selectedProvider);
  }, [aiConfig.selectedProvider]);

  // Verificar se IA está habilitada e configurada
  const isAIReady = useCallback((): boolean => {
    // Para provider local, sempre permitir se estiver habilitado
    if (aiConfig.selectedProvider === 'local') {
      return aiConfig.enabled;
    }
    
    if (!aiConfig.enabled) return false;
    
    const provider = getCurrentProvider();
    if (!provider) return false;
    
    if (provider.requiresApiKey && !aiConfig.apiKey) return false;
    
    return true;
  }, [aiConfig.enabled, aiConfig.selectedProvider, aiConfig.apiKey, getCurrentProvider]);

  // Obter features habilitadas
  const getEnabledFeatures = useCallback(() => {
    return Object.entries(aiConfig.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);
  }, [aiConfig.features]);

  // Estatísticas de uso
  const getUsageStats = useCallback(() => {
    const stats = localStorage.getItem('krigzis-ai-usage-stats');
    if (stats) {
      return JSON.parse(stats);
    }
    return {
      totalPredictions: 0,
      totalInsights: 0,
      averageAccuracy: 0,
      lastUsed: null,
    };
  }, []);

  // Atualizar estatísticas de uso
  const updateUsageStats = useCallback((stats: any) => {
    localStorage.setItem('krigzis-ai-usage-stats', JSON.stringify(stats));
  }, []);

  return {
    // Estado
    aiConfig,
    aiConfigVersion, // Export version for real-time updates
    isLoading,
    error,
    
    // Dados
    providers: AI_PROVIDERS,
    presets: AI_PRESETS,
    
    // Ações
    updateConfig,
    applyPreset,
    resetToDefault,
    validateApiConfig,
    
    // Utilitários
    getCurrentProvider,
    isAIReady,
    getEnabledFeatures,
    getUsageStats,
    updateUsageStats,
    
    // Limpar erro
    clearError: () => setError(null),
  };
}; 
 
 