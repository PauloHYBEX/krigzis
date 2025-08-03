// Tipos para configuração de IA personalizada por usuário

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  requiresApiKey: boolean;
  supportedFeatures: AIFeature[];
}

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AIConfiguration {
  // Configurações gerais
  enabled: boolean;
  selectedProvider: string;
  
  // Configurações de API
  apiKey?: string;
  apiUrl?: string;
  customEndpoints?: Record<string, string>;
  
  // Features habilitadas
  features: {
    taskDurationPrediction: boolean;
    taskCategorization: boolean;
    productivityAnalysis: boolean;
    scheduleOptimization: boolean;
    burnoutDetection: boolean;
    smartNotifications: boolean;
    workPatternAnalysis: boolean;
    insightGeneration: boolean;
  };
  
  // Configurações de performance
  performance: {
    predictionConfidenceThreshold: number; // 0.0 - 1.0
    maxPredictionLatency: number; // ms
    enableLocalProcessing: boolean;
    batchSize: number;
  };
  
  // Configurações de privacidade
  privacy: {
    dataRetentionDays: number;
    anonymizeData: boolean;
    shareUsageStatistics: boolean;
    enableTelemetry: boolean;
  };
  
  // Configurações de retraining (Regras W4 e W5)
  retraining: {
    enabled: boolean;
    accuracyThreshold: number; // 0.85 por padrão
    dataThreshold: number; // Mínimo de dados para retraining
    maxDataAge: number; // dias
    autoRetraining: boolean;
  };
  
  // Configurações de monitoramento
  monitoring: {
    enabled: boolean;
    driftDetectionThreshold: number; // 0.15 por padrão
    performanceAlertsEnabled: boolean;
    healthCheckInterval: number; // minutos
  };
  
  // Metadados
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface AIProviderPreset {
  id: string;
  name: string;
  provider: string;
  description: string;
  configuration: Partial<AIConfiguration>;
  isRecommended: boolean;
  tags: string[];
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type InsightType = 
  | 'productivity-high'
  | 'productivity-low'
  | 'timing-optimal'
  | 'break-needed'
  | 'burnout-risk'
  | 'pattern-detected'
  | 'schedule-suggestion'
  | 'task-prediction'
  | 'category-suggestion';

export interface DurationPrediction {
  taskId: string;
  estimatedMinutes: number;
  confidence: number;
  factors: string[];
  timestamp: string;
  modelVersion: string;
}

export interface CategoryPrediction {
  category: string;
  confidence: number;
  suggestedTags: string[];
  reasoning: string;
}

export interface ProductivityReport {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    tasksCompleted: number;
    totalFocusTime: number;
    averageTaskDuration: number;
    productivityScore: number;
    peakHours: number[];
  };
  insights: AIInsight[];
  recommendations: string[];
  trends: {
    productivity: 'increasing' | 'decreasing' | 'stable';
    focusTime: 'increasing' | 'decreasing' | 'stable';
    taskCompletion: 'increasing' | 'decreasing' | 'stable';
  };
}

// Configurações padrão
export const DEFAULT_AI_CONFIG: AIConfiguration = {
  enabled: true, // Mudança: habilitada por padrão
  selectedProvider: 'local',
  
  features: {
    taskDurationPrediction: true,
    taskCategorization: true,
    productivityAnalysis: true,
    scheduleOptimization: false,
    burnoutDetection: true,
    smartNotifications: false,
    workPatternAnalysis: true,
    insightGeneration: true,
  },
  
  performance: {
    predictionConfidenceThreshold: 0.7,
    maxPredictionLatency: 100,
    enableLocalProcessing: true,
    batchSize: 10,
  },
  
  privacy: {
    dataRetentionDays: 90,
    anonymizeData: true,
    shareUsageStatistics: false,
    enableTelemetry: false,
  },
  
  retraining: {
    enabled: true,
    accuracyThreshold: 0.85,
    dataThreshold: 100,
    maxDataAge: 30,
    autoRetraining: true,
  },
  
  monitoring: {
    enabled: true,
    driftDetectionThreshold: 0.15,
    performanceAlertsEnabled: true,
    healthCheckInterval: 60,
  },
  
  userId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0',
};

// Provedores de IA disponíveis
export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'local',
    name: 'IA Local (TensorFlow.js)',
    description: 'Processamento local usando TensorFlow.js - Máxima privacidade',
    apiUrl: '',
    requiresApiKey: false,
    supportedFeatures: [
      { id: 'duration', name: 'Predição de Duração', description: 'Estima tempo de conclusão de tarefas', enabled: true },
      { id: 'categorization', name: 'Categorização', description: 'Classifica tarefas automaticamente', enabled: true },
      { id: 'productivity', name: 'Análise de Produtividade', description: 'Analisa padrões de trabalho', enabled: true },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'Integração com modelos GPT da OpenAI - Requer API Key',
    apiUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    supportedFeatures: [
      { id: 'nlp', name: 'Processamento de Linguagem', description: 'Análise avançada de texto', enabled: true },
      { id: 'insights', name: 'Insights Avançados', description: 'Recomendações inteligentes', enabled: true },
      { id: 'categorization', name: 'Categorização Avançada', description: 'Classificação baseada em contexto', enabled: true },
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Integração com Google Gemini AI - Requer API Key',
    apiUrl: 'https://generativelanguage.googleapis.com/v1',
    requiresApiKey: true,
    supportedFeatures: [
      { id: 'nlp', name: 'Processamento de Linguagem', description: 'Análise avançada de texto', enabled: true },
      { id: 'insights', name: 'Insights Avançados', description: 'Recomendações inteligentes', enabled: true },
      { id: 'categorization', name: 'Categorização Avançada', description: 'Classificação baseada em contexto', enabled: true },
      { id: 'reasoning', name: 'Raciocínio Avançado', description: 'Análise complexa de dados', enabled: true },
    ]
  },
  {
    id: 'custom',
    name: 'API Personalizada',
    description: 'Configure sua própria API de IA - Máxima flexibilidade',
    apiUrl: '',
    requiresApiKey: true,
    supportedFeatures: [
      { id: 'custom', name: 'Funcionalidades Personalizadas', description: 'Defina suas próprias funcionalidades', enabled: true },
    ]
  }
];

export const AI_PRESETS: AIProviderPreset[] = [
  {
    id: 'privacy-focused',
    name: 'Foco na Privacidade',
    provider: 'local',
    description: 'Configuração otimizada para máxima privacidade com processamento 100% local',
    isRecommended: true,
    tags: ['privacidade', 'local', 'seguro'],
    configuration: {
      selectedProvider: 'local',
      privacy: {
        dataRetentionDays: 30,
        anonymizeData: true,
        shareUsageStatistics: false,
        enableTelemetry: false,
      },
      performance: {
        predictionConfidenceThreshold: 0.7,
        maxPredictionLatency: 100,
        enableLocalProcessing: true,
        batchSize: 10,
      }
    }
  },
  {
    id: 'performance-optimized',
    name: 'Otimizado para Performance',
    provider: 'local',
    description: 'Configuração balanceada entre funcionalidades e performance',
    isRecommended: true,
    tags: ['performance', 'balanceado', 'rápido'],
    configuration: {
      performance: {
        predictionConfidenceThreshold: 0.8,
        maxPredictionLatency: 50,
        enableLocalProcessing: true,
        batchSize: 20,
      },
      features: {
        taskDurationPrediction: true,
        taskCategorization: true,
        productivityAnalysis: true,
        scheduleOptimization: true,
        burnoutDetection: true,
        smartNotifications: true,
        workPatternAnalysis: true,
        insightGeneration: true,
      }
    }
  },
  {
    id: 'advanced-ai',
    name: 'IA Avançada (OpenAI)',
    provider: 'openai',
    description: 'Recursos avançados de IA usando modelos GPT - Requer API Key',
    isRecommended: false,
    tags: ['avançado', 'gpt', 'cloud'],
    configuration: {
      selectedProvider: 'openai',
      features: {
        taskDurationPrediction: true,
        taskCategorization: true,
        productivityAnalysis: true,
        scheduleOptimization: true,
        burnoutDetection: true,
        smartNotifications: true,
        workPatternAnalysis: true,
        insightGeneration: true,
      }
    }
  },
  {
    id: 'gemini-ai',
    name: 'Google Gemini AI',
    provider: 'gemini',
    description: 'Recursos avançados usando Google Gemini - Requer API Key',
    isRecommended: true,
    tags: ['avançado', 'gemini', 'google', 'cloud'],
    configuration: {
      selectedProvider: 'gemini',
      features: {
        taskDurationPrediction: true,
        taskCategorization: true,
        productivityAnalysis: true,
        scheduleOptimization: true,
        burnoutDetection: true,
        smartNotifications: true,
        workPatternAnalysis: true,
        insightGeneration: true,
      },
      performance: {
        predictionConfidenceThreshold: 0.8,
        maxPredictionLatency: 150,
        enableLocalProcessing: false,
        batchSize: 5,
      }
    }
  }
]; 
 
 