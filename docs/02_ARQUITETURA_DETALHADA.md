# 🏗️ Arquitetura Detalhada - Krigzis

**Data de Criação**: Dezembro 2024  
**Versão**: 2.0.0  
**Status**: ✅ Implementada - Fase 3 Concluída  

## 🎯 Visão Arquitetural

### Padrão Arquitetural: Clean Architecture + Event-Driven + ML-Enhanced

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│                  (React Components + Hooks)               │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                      │
│              (Services + Use Cases + Events)              │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                          │
│              (Entities + Business Rules)                  │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                     │
│            (Database + AI/ML + File System)               │
└─────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais
1. **Separação de Responsabilidades**: Cada camada tem responsabilidade específica
2. **Inversão de Dependência**: Camadas superiores não dependem de detalhes
3. **Event-Driven**: Comunicação através de eventos customizados
4. **ML-First**: IA integrada desde o design arquitetural
5. **Performance-Oriented**: Otimizações em cada camada

## 🏢 Estrutura de Camadas

### 1. Presentation Layer (React + TypeScript)

```typescript
src/renderer/
├── components/
│   ├── Dashboard.tsx           # Interface principal
│   ├── TaskList.tsx            # Lista de tarefas
│   ├── TaskModal.tsx           # Modal CRUD
│   ├── Timer.tsx               # Timer Pomodoro
│   ├── Settings.tsx            # Configurações
│   └── ui/                     # Design System
│       ├── Button.tsx          # 4 variantes
│       ├── Card.tsx            # 3 tipos
│       ├── Input.tsx           # Com validação
│       └── Badge.tsx           # Indicadores
├── hooks/                      # Custom Hooks (15+)
│   ├── useDatabase.ts          # Acesso a dados
│   ├── useTimer.ts             # Lógica timer
│   ├── useSettings.ts          # Configurações
│   ├── useCategories.ts        # Gestão categorias
│   ├── useAIConfig.ts          # Config IA
│   └── useTheme.ts             # Sistema temas
└── styles/                     # Design System CSS
    ├── global.css              # Estilos globais
    ├── variables.css           # Design tokens
    ├── components.css          # Componentes
    └── animations.css          # Animações
```

### 2. Application Layer (Services + Use Cases)

```typescript
src/renderer/services/
├── ai/
│   ├── AIService.ts            # Serviço principal IA
│   ├── models/
│   │   ├── duration-predictor/ # Predição duração
│   │   ├── categorizer/        # Categorização
│   │   └── productivity/       # Análise produtividade
│   └── pipeline/
│       ├── feature-extractor.ts # Extração features
│       └── preprocessor.ts     # Pré-processamento
├── database.ts                 # Abstração banco
└── events/
    ├── task-events.ts          # Eventos de tarefas
    └── ai-events.ts            # Eventos IA
```

### 3. Domain Layer (Entities + Business Rules)

```typescript
src/shared/types/
├── task.ts                     # Entidade Task
├── category.ts                 # Entidade Category
├── timer.ts                    # Entidade Timer
├── ai-config.ts                # Config IA
└── database.ts                 # Contratos DB

// Regras de Negócio Principais
interface BusinessRules {
  W1: "Todas as tarefas devem ter título não vazio";
  W2: "Status deve seguir fluxo: backlog → esta_semana → hoje → concluido";
  W3: "IA deve validar dados antes de predições";
  W4: "Monitorar modelos e alertar para drift"; // 🔄 Implementando
  W5: "Retreinamento automático por performance"; // 🔄 Implementando
}
```

### 4. Infrastructure Layer (Database + AI + File System)

```typescript
src/main/
├── database-manager.ts         # Gerenciador principal
├── index.ts                    # Processo Electron
└── preload.ts                  # Bridge IPC

src/shared/database/
├── memory-db.ts                # MemoryDatabase
├── migrations/                 # Preparação SQLite
└── connection.ts               # Abstração conexão
```

## 🔄 Fluxo de Dados e Eventos

### Sistema de Eventos Implementado

```typescript
// Eventos do Sistema
interface SystemEvents {
  // Eventos de Tarefas
  'task:created': Task;
  'task:updated': { id: number; changes: Partial<Task> };
  'task:deleted': { id: number };
  'task:completed': Task;
  
  // Eventos de Categorias
  'categoriesUpdated': void;
  'category:created': Category;
  
  // Eventos de IA
  'ai:prediction:ready': { taskId: number; prediction: any };
  'ai:training:complete': { modelType: string; metrics: any };
  'ai:drift:detected': { model: string; severity: number };
  
  // Eventos de Sistema
  'tasksUpdated': void;
  'settingsChanged': { key: string; value: any };
}

// Uso dos Eventos
window.dispatchEvent(new CustomEvent('tasksUpdated'));
window.addEventListener('tasksUpdated', handleTasksUpdate);
```

### Fluxo de Dados Principal

```
User Action → Component → Hook → Service → Database → Event → Update UI
     ↓
[Dashboard] → [useDatabase] → [DatabaseService] → [MemoryDB] → [tasksUpdated] → [Re-render]
```

### Fluxo de IA/ML

```
Task Input → Feature Extraction → Model Prediction → Validation → Result
     ↓
[TaskModal] → [AIService] → [TensorFlow.js] → [Validation] → [UI Update]
```

## 🧠 Arquitetura de IA/ML

### Sistema AIService

```typescript
class AIService {
  private models: {
    durationPredictor: tf.LayersModel;
    categoryClassifier: tf.LayersModel;
    productivityAnalyzer: tf.LayersModel;
  };
  
  // Predições Principais
  async predictDuration(task: Task): Promise<DurationPrediction>
  async predictCategory(task: Task): Promise<CategoryPrediction>
  async generateInsights(tasks: Task[]): Promise<AIInsight[]>
  
  // Treinamento e Monitoramento
  async trainModels(tasks: Task[]): Promise<void>
  async monitorPerformance(): Promise<ModelMetrics> // 🔄 W4
  async scheduleRetraining(): Promise<boolean> // 🔄 W5
}
```

### Modelos Neural Networks

#### 1. Duration Predictor
```typescript
// Arquitetura: 10 → 64 → 32 → 16 → 1
const durationModel = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dense({ units: 16, activation: 'relu' }),
    tf.layers.dense({ units: 1, activation: 'linear' }) // Saída: minutos
  ]
});

// Features (10 dimensões)
const features = [
  title.length / 100,           // Tamanho título
  description.length / 500,     // Tamanho descrição
  priorityScore,                // 0, 0.5, 1
  categoryScore,                // Score categoria
  wordCount / 20,               // Contagem palavras
  hasKeyword('reunião') ? 1 : 0, // Flags contextuais
  hasKeyword('projeto') ? 1 : 0,
  hasKeyword('urgente') ? 1 : 0,
  currentHour / 24,             // Hora atual
  dayOfWeek / 7                 // Dia semana
];
```

#### 2. Category Classifier
```typescript
// Arquitetura: 50 → 128 → 64 → 32 → 10
const categoryModel = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.3 }),
    tf.layers.dense({ units: 64, activation: 'relu' }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dense({ units: 10, activation: 'softmax' }) // 10 categorias
  ]
});

// Categorias Suportadas
const categories = [
  'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Lazer',
  'Financeiro', 'Casa', 'Compras', 'Reuniões', 'Projetos'
];
```

### Pipeline de Feature Engineering

```typescript
class FeatureExtractor {
  // Extração para Duration Model
  extractDurationFeatures(task: Task): number[] {
    const keywords = this.extractKeywords(task.title + ' ' + task.description);
    const temporal = this.extractTemporalFeatures();
    const textual = this.extractTextualFeatures(task);
    
    return [...textual, ...temporal, ...keywords];
  }
  
  // Extração para Category Model  
  extractCategoryFeatures(task: Task): number[] {
    const tfidf = this.computeTFIDF(task.title + ' ' + task.description);
    const contextual = this.extractContextualFeatures(task);
    
    return [...tfidf, ...contextual];
  }
  
  private computeTFIDF(text: string): number[] {
    // TF-IDF implementation for 40 dimensions
  }
  
  private extractKeywords(text: string): number[] {
    // Keyword extraction for contextual features
  }
}
```

## 💾 Arquitetura de Dados

### MemoryDatabase (Atual)

```typescript
class MemoryDatabase implements DatabaseInterface {
  private tasks: Task[] = [];
  private categories: Category[] = [];
  private settings: Settings = {};
  private dataPath: string = 'data/memory-tasks.json';
  
  // CRUD Operations
  async createTask(data: CreateTaskData): Promise<Task> {
    const task = { id: this.generateId(), ...data, created_at: new Date().toISOString() };
    this.tasks.push(task);
    await this.saveToFile();
    this.emitEvent('task:created', task);
    return task;
  }
  
  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    this.tasks[index] = { ...this.tasks[index], ...updates, updated_at: new Date().toISOString() };
    await this.saveToFile();
    this.emitEvent('task:updated', { id, changes: updates });
    return this.tasks[index];
  }
  
  // Persistência Automática
  private async saveToFile(): Promise<void> {
    const data = {
      tasks: this.tasks,
      categories: this.categories,
      settings: this.settings,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }
  
  private async loadFromFile(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.tasks = parsed.tasks || [];
      this.categories = parsed.categories || [];
      this.settings = parsed.settings || {};
    } catch (error) {
      console.log('No existing data file, starting fresh');
    }
  }
}
```

### Migração Futura SQLite (Fase 5)

```sql
-- Schema Planejado
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('backlog', 'esta_semana', 'hoje', 'concluido')),
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
  category_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  prediction_type TEXT,
  predicted_value REAL,
  confidence REAL,
  actual_value REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

## 🔧 Configuração e Build

### Webpack Configuration

```javascript
// webpack.renderer.config.js - Configuração principal
module.exports = {
  target: 'electron-renderer',
  entry: './src/renderer/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html'
    })
  ]
};
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/renderer/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🔐 Segurança e Performance

### Electron Security

```typescript
// main/index.ts - Configuração segura
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Desabilitar node no renderer
    contextIsolation: true,        // Isolar contextos
    enableRemoteModule: false,     // Desabilitar remote
    preload: path.join(__dirname, 'preload.js')
  }
});

// preload.ts - Bridge segura
contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getTasks: () => ipcRenderer.invoke('database:getTasks'),
    createTask: (data) => ipcRenderer.invoke('database:createTask', data),
    updateTask: (id, updates) => ipcRenderer.invoke('database:updateTask', id, updates),
    deleteTask: (id) => ipcRenderer.invoke('database:deleteTask', id)
  },
  ai: {
    predictDuration: (task) => ipcRenderer.invoke('ai:predictDuration', task),
    predictCategory: (task) => ipcRenderer.invoke('ai:predictCategory', task)
  }
});
```

### Performance Optimizations

```typescript
// Memoização de componentes pesados
const TaskList = React.memo(({ tasks, onTaskUpdate }) => {
  const memoizedTasks = useMemo(() => 
    tasks.filter(task => task.status === 'hoje'), [tasks]
  );
  
  return (
    <div>
      {memoizedTasks.map(task => (
        <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} />
      ))}
    </div>
  );
});

// Debounce para operações custosas
const useAIPrediction = (task: Task) => {
  const [prediction, setPrediction] = useState(null);
  
  const debouncedPredict = useCallback(
    debounce(async (taskData) => {
      const result = await aiService.predictDuration(taskData);
      setPrediction(result);
    }, 500),
    []
  );
  
  useEffect(() => {
    if (task.title) {
      debouncedPredict(task);
    }
  }, [task.title, task.description, debouncedPredict]);
  
  return prediction;
};
```

## 📊 Monitoramento e Métricas

### Performance Monitoring (Implementado)

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }
  
  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(value);
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}

// Uso
const timer = performanceMonitor.startTimer('ai:prediction');
const prediction = await aiService.predictDuration(task);
timer(); // Registra o tempo
```

### Health Checks

```typescript
interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  ai: 'healthy' | 'degraded' | 'down';
  memory: number; // MB
  startup: number; // ms
  predictions: number; // average ms
}

const healthCheck = async (): Promise<SystemHealth> => {
  return {
    database: await checkDatabase(),
    ai: await checkAIService(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
    startup: getStartupTime(),
    predictions: performanceMonitor.getAverageTime('ai:prediction')
  };
};
```

---

**Próximo Documento**: [03_FASES_DESENVOLVIMENTO.md](03_FASES_DESENVOLVIMENTO.md)  
**Documento Anterior**: [01_VISAO_GERAL_PROJETO.md](01_VISAO_GERAL_PROJETO.md)  

**Última Atualização**: Dezembro 2024  
**Responsável**: Equipe de Arquitetura Krigzis