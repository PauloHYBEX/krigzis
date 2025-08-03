import * as tf from '@tensorflow/tfjs';
import { 
  AIConfiguration, 
  DurationPrediction, 
  CategoryPrediction, 
  ProductivityReport,
  AIInsight,
  InsightType
} from '../../../shared/types/ai-config';
import { Task, TaskStatus } from '../../../shared/types/task';

interface APIResponse {
  predictions?: any[];
  choices?: any[];
  candidates?: any[];
  error?: string;
}

export class AIService {
  private static instance: AIService;
  private config: AIConfiguration | null = null;
  private models: Map<string, tf.LayersModel> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(config: AIConfiguration): Promise<void> {
    this.config = config;
    
    if (!config.enabled) {
      console.log('AI Service disabled by configuration');
      return;
    }

    try {
      // Inicializar TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');

      // Carregar ou criar modelos
      await this.loadModels();
      
      this.isInitialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Service:', error);
      throw error;
    }
  }

  private async loadModels(): Promise<void> {
    try {
      // Tentar carregar modelos salvos ou criar novos
      await this.loadOrCreateDurationModel();
      await this.loadOrCreateCategoryModel();
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  private async loadOrCreateDurationModel(): Promise<void> {
    try {
      // Tentar carregar modelo salvo
      const model = await tf.loadLayersModel('localstorage://duration-model');
      this.models.set('duration', model);
      console.log('Duration model loaded from storage');
    } catch (error) {
      // Criar novo modelo se não existir
      const model = this.createDurationModel();
      this.models.set('duration', model);
      console.log('New duration model created');
    }
  }

  private async loadOrCreateCategoryModel(): Promise<void> {
    try {
      const model = await tf.loadLayersModel('localstorage://category-model');
      this.models.set('category', model);
      console.log('Category model loaded from storage');
    } catch (error) {
      const model = this.createCategoryModel();
      this.models.set('category', model);
      console.log('New category model created');
    }
  }

  private createDurationModel(): tf.LayersModel {
    // Modelo simples para predição de duração
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10], // Features: title length, category, priority, etc.
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear' // Predição de duração em minutos
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  private createCategoryModel(): tf.LayersModel {
    // Modelo para categorização de tarefas
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [50], // Features baseadas no texto da tarefa
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 10, // 10 categorias principais
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictDuration(task: Task): Promise<DurationPrediction | null> {
    if (!this.isInitialized || !this.config?.features.taskDurationPrediction) {
      return null;
    }

    try {
      // Usar API externa se configurada
      if (this.config.selectedProvider !== 'local' && this.config.apiKey) {
        return await this.predictDurationWithAPI(task);
      }

      // Usar modelo local
      const model = this.models.get('duration');
      if (!model) {
        throw new Error('Duration model not available');
      }

      // Extrair features da tarefa
      const features = this.extractDurationFeatures(task);
      const prediction = model.predict(tf.tensor2d([features])) as tf.Tensor;
      const durationMinutes = await prediction.data();
      
      // Limpar tensores
      prediction.dispose();

      const estimatedMinutes = Math.max(5, Math.round(durationMinutes[0]));
      const confidence = this.calculateConfidence(features, estimatedMinutes);

      if (confidence < this.config.performance.predictionConfidenceThreshold) {
        return null;
      }

      return {
        taskId: task.id.toString(),
        estimatedMinutes,
        confidence,
        factors: this.identifyDurationFactors(task),
        timestamp: new Date().toISOString(),
        modelVersion: '1.0.0'
      };
    } catch (error) {
      console.error('Error predicting duration:', error);
      return null;
    }
  }

  private async predictDurationWithAPI(task: Task): Promise<DurationPrediction | null> {
    if (!this.config) return null;

    try {
      const prompt = this.buildDurationPrompt(task);
      const response = await this.callExternalAPI(prompt, 'duration');
      
      if (!response || response.error) {
        console.error('API Error:', response?.error);
        return null;
      }

      const result = this.parseDurationResponse(response);
      if (!result) return null;

      return {
        taskId: task.id.toString(),
        estimatedMinutes: result.minutes,
        confidence: result.confidence,
        factors: result.factors || this.identifyDurationFactors(task),
        timestamp: new Date().toISOString(),
        modelVersion: `${this.config.selectedProvider}-api`
      };
    } catch (error) {
      console.error('Error with external API:', error);
      return null;
    }
  }

  private buildDurationPrompt(task: Task): string {
    return `Analise a seguinte tarefa e estime sua duração em minutos:

Tarefa: ${task.title}
Descrição: ${task.description || 'Sem descrição'}
Prioridade: ${task.priority || 'Não definida'}
Categoria: ${task.category_id || 'Não definida'}
Tags: Nenhuma

Forneça sua resposta no formato JSON:
{
  "minutes": número_de_minutos,
  "confidence": confiança_de_0_a_1,
  "factors": ["fator1", "fator2"],
  "reasoning": "explicação_breve"
}

Considere:
- Complexidade da tarefa
- Tempo típico para tarefas similares
- Prioridade e urgência
- Contexto fornecido`;
  }

  async predictCategory(task: Task): Promise<CategoryPrediction | null> {
    if (!this.isInitialized || !this.config?.features.taskCategorization) {
      return null;
    }

    try {
      const model = this.models.get('category');
      if (!model) {
        throw new Error('Category model not available');
      }

      const features = this.extractCategoryFeatures(task);
      const prediction = model.predict(tf.tensor2d([features])) as tf.Tensor;
      const probabilities = await prediction.data();
      
      prediction.dispose();

      const categories = [
        'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Lazer',
        'Financeiro', 'Casa', 'Compras', 'Reuniões', 'Projetos'
      ];

      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[maxIndex];

      if (confidence < this.config.performance.predictionConfidenceThreshold) {
        return null;
      }

      return {
        category: categories[maxIndex],
        confidence,
        suggestedTags: this.generateTags(task, categories[maxIndex]),
        reasoning: this.generateCategoryReasoning(task, categories[maxIndex])
      };
    } catch (error) {
      console.error('Error predicting category:', error);
      return null;
    }
  }

  async generateInsights(tasks: Task[]): Promise<AIInsight[]> {
    if (!this.isInitialized || !this.config?.features.insightGeneration) {
      return [];
    }

    const insights: AIInsight[] = [];

    try {
      // Análise de produtividade
      const productivityInsight = this.analyzeProductivity(tasks);
      if (productivityInsight) insights.push(productivityInsight);

      // Análise de padrões temporais
      const timingInsight = this.analyzeTimingPatterns(tasks);
      if (timingInsight) insights.push(timingInsight);

      // Detecção de sobrecarga
      const burnoutInsight = this.detectBurnoutRisk(tasks);
      if (burnoutInsight) insights.push(burnoutInsight);

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  async trainModels(tasks: Task[]): Promise<void> {
    if (!this.isInitialized || tasks.length < 10) {
      return;
    }

    try {
      await this.trainDurationModel(tasks);
      await this.trainCategoryModel(tasks);
      await this.saveModels();
    } catch (error) {
      console.error('Error training models:', error);
    }
  }

  private async trainDurationModel(tasks: Task[]): Promise<void> {
    const model = this.models.get('duration');
    if (!model) return;

    // Usar tarefas concluídas com duração estimada
    const completedTasks = tasks.filter(t => t.status === 'concluido');
    if (completedTasks.length < 5) return;

    const features = completedTasks.map(task => this.extractDurationFeatures(task));
    const labels = completedTasks.map(task => this.estimateTaskDuration(task));

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Duration model training - Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}`);
          }
        }
      }
    });

    xs.dispose();
    ys.dispose();
  }

  private async trainCategoryModel(tasks: Task[]): Promise<void> {
    const model = this.models.get('category');
    if (!model) return;

    // Usar tarefas que já têm categoria definida
    const categorizedTasks = tasks.filter(t => this.getTaskCategory(t));
    if (categorizedTasks.length < 10) return;

    const features = categorizedTasks.map(task => this.extractCategoryFeatures(task));
    const labels = categorizedTasks.map(task => this.categoryToOneHot(this.getTaskCategory(task) || 'Geral'));

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    await model.fit(xs, ys, {
      epochs: 30,
      batchSize: 16,
      validationSplit: 0.2,
      shuffle: true
    });

    xs.dispose();
    ys.dispose();
  }

  private async saveModels(): Promise<void> {
    try {
      const durationModel = this.models.get('duration');
      if (durationModel) {
        await durationModel.save('localstorage://duration-model');
      }

      const categoryModel = this.models.get('category');
      if (categoryModel) {
        await categoryModel.save('localstorage://category-model');
      }

      console.log('Models saved successfully');
    } catch (error) {
      console.error('Error saving models:', error);
    }
  }

  private extractDurationFeatures(task: Task): number[] {
    const title = task.title || '';
    const description = task.description || '';
    
    return [
      title.length / 100, // Normalized title length
      description.length / 500, // Normalized description length
      task.priority === 'high' ? 1 : task.priority === 'medium' ? 0.5 : 0,
      this.getCategoryScore(this.getTaskCategory(task)),
      title.split(' ').length / 20, // Word count normalized
      title.includes('reunião') || title.includes('meeting') ? 1 : 0,
      title.includes('projeto') || title.includes('project') ? 1 : 0,
      title.includes('urgente') || title.includes('urgent') ? 1 : 0,
      new Date().getHours() / 24, // Current hour normalized
      new Date().getDay() / 7 // Day of week normalized
    ];
  }

  private extractCategoryFeatures(task: Task): number[] {
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';
    const combined = `${title} ${description}`;

    // Features baseadas em palavras-chave
    const features = new Array(50).fill(0);
    
    const keywords = {
      trabalho: ['trabalho', 'reunião', 'projeto', 'cliente', 'empresa', 'escritório'],
      pessoal: ['pessoal', 'família', 'amigo', 'casa', 'relaxar'],
      estudos: ['estudo', 'curso', 'livro', 'aprender', 'prova', 'universidade'],
      saude: ['médico', 'exercício', 'academia', 'saúde', 'consulta'],
      lazer: ['filme', 'jogo', 'diversão', 'hobby', 'entretenimento'],
      financeiro: ['banco', 'pagamento', 'conta', 'dinheiro', 'orçamento'],
      casa: ['limpar', 'organizar', 'cozinhar', 'reforma', 'manutenção'],
      compras: ['comprar', 'mercado', 'shopping', 'produto', 'lista'],
      reunioes: ['reunião', 'meeting', 'call', 'videoconferência'],
      projetos: ['projeto', 'desenvolvimento', 'planejamento', 'entrega']
    };

    let index = 0;
    Object.entries(keywords).forEach(([category, words]) => {
      words.forEach(word => {
        if (index < 50) {
          features[index] = combined.includes(word) ? 1 : 0;
          index++;
        }
      });
    });

    return features;
  }

  private getCategoryScore(category?: string): number {
    const scores: Record<string, number> = {
      'Trabalho': 0.8,
      'Pessoal': 0.4,
      'Estudos': 0.6,
      'Saúde': 0.5,
      'Lazer': 0.3,
      'Financeiro': 0.7,
      'Casa': 0.5,
      'Compras': 0.2,
      'Reuniões': 0.9,
      'Projetos': 1.0
    };
    return scores[category || 'Geral'] || 0.5;
  }

  private getTaskCategory(task: Task): string | undefined {
    // Extrair categoria do título ou descrição se não houver campo específico
    const content = `${task.title} ${task.description}`.toLowerCase();
    
    if (content.includes('trabalho') || content.includes('reunião') || content.includes('projeto')) {
      return 'Trabalho';
    } else if (content.includes('pessoal') || content.includes('família')) {
      return 'Pessoal';
    } else if (content.includes('estudo') || content.includes('curso')) {
      return 'Estudos';
    } else if (content.includes('médico') || content.includes('saúde')) {
      return 'Saúde';
    } else if (content.includes('compra') || content.includes('mercado')) {
      return 'Compras';
    }
    
    return undefined;
  }

  private estimateTaskDuration(task: Task): number {
    // Estimativa baseada no conteúdo da tarefa
    const title = task.title || '';
    const description = task.description || '';
    
    let duration = 30; // Base de 30 minutos
    
    // Ajustes baseados no conteúdo
    if (title.includes('reunião')) duration += 30;
    if (title.includes('projeto')) duration += 60;
    if (task.priority === 'high') duration += 15;
    if (description.length > 100) duration += 20;
    
    return Math.min(duration, 240); // Máximo de 4 horas
  }

  private categoryToOneHot(category: string): number[] {
    const categories = [
      'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Lazer',
      'Financeiro', 'Casa', 'Compras', 'Reuniões', 'Projetos'
    ];
    const oneHot = new Array(10).fill(0);
    const index = categories.indexOf(category);
    if (index !== -1) {
      oneHot[index] = 1;
    }
    return oneHot;
  }

  private calculateConfidence(features: number[], prediction: number): number {
    // Lógica simples de confiança baseada na consistência dos features
    const featureSum = features.reduce((sum, f) => sum + f, 0);
    const normalizedSum = featureSum / features.length;
    
    // Maior confiança para predições mais conservadoras
    const predictionFactor = Math.min(prediction / 60, 1); // Normalizar para 1 hora
    
    return Math.min(0.95, normalizedSum * 0.7 + predictionFactor * 0.3);
  }

  private identifyDurationFactors(task: Task): string[] {
    const factors: string[] = [];
    const title = task.title?.toLowerCase() || '';
    
    if (task.priority === 'high') factors.push('Alta prioridade');
    if (title.includes('reunião')) factors.push('Reunião');
    if (title.includes('projeto')) factors.push('Projeto complexo');
    if (task.description && task.description.length > 100) factors.push('Descrição detalhada');
    
    return factors.length > 0 ? factors : ['Análise padrão'];
  }

  private generateTags(task: Task, category: string): string[] {
    const tags: string[] = [category.toLowerCase()];
    const title = task.title?.toLowerCase() || '';
    
    if (title.includes('urgente')) tags.push('urgente');
    if (title.includes('importante')) tags.push('importante');
    if (task.priority === 'high') tags.push('alta-prioridade');
    
    return tags;
  }

  private generateCategoryReasoning(task: Task, category: string): string {
    const title = task.title || '';
    return `Categorizado como "${category}" baseado no conteúdo: "${title.substring(0, 50)}..."`;
  }

  private analyzeProductivity(tasks: Task[]): AIInsight | null {
    const completedTasks = tasks.filter(t => t.status === 'concluido');
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) return null;
    
    const completionRate = completedTasks.length / totalTasks;
    
    if (completionRate > 0.8) {
      return {
        id: `productivity-${Date.now()}`,
        type: 'productivity-high',
        title: 'Excelente Produtividade!',
        description: `Você completou ${Math.round(completionRate * 100)}% das suas tarefas.`,
        recommendation: 'Continue mantendo esse ritmo excelente!',
        confidence: 0.9,
        timestamp: new Date().toISOString()
      };
    } else if (completionRate < 0.5) {
      return {
        id: `productivity-${Date.now()}`,
        type: 'productivity-low',
        title: 'Oportunidade de Melhoria',
        description: `Taxa de conclusão atual: ${Math.round(completionRate * 100)}%`,
        recommendation: 'Considere dividir tarefas grandes em menores ou revisar suas prioridades.',
        confidence: 0.8,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  private analyzeTimingPatterns(tasks: Task[]): AIInsight | null {
    const completedTasks = tasks.filter(t => t.status === 'concluido' && t.completed_at);
    
    if (completedTasks.length < 5) return null;
    
    const hourCounts: Record<number, number> = {};
    
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (peakHour) {
      return {
        id: `timing-${Date.now()}`,
        type: 'timing-optimal',
        title: 'Horário Produtivo Identificado',
        description: `Você é mais produtivo às ${peakHour}h`,
        recommendation: `Tente agendar tarefas importantes para às ${peakHour}h`,
        confidence: 0.75,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  private detectBurnoutRisk(tasks: Task[]): AIInsight | null {
    const recentTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate > weekAgo;
    });
    
    const highPriorityTasks = recentTasks.filter(t => t.priority === 'high');
    const overdueTasks = recentTasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status !== 'concluido';
    });
    
    const riskScore = (highPriorityTasks.length * 0.3) + (overdueTasks.length * 0.5);
    
    if (riskScore > 3) {
      return {
        id: `burnout-${Date.now()}`,
        type: 'burnout-risk',
        title: 'Risco de Sobrecarga Detectado',
        description: `${highPriorityTasks.length} tarefas de alta prioridade e ${overdueTasks.length} em atraso`,
        recommendation: 'Considere fazer uma pausa ou redistribuir algumas tarefas.',
        confidence: 0.8,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  private async callExternalAPI(prompt: string, type: string): Promise<APIResponse | null> {
    if (!this.config || !this.config.apiKey) return null;

    try {
      const { selectedProvider, apiKey, apiUrl } = this.config;

      if (selectedProvider === 'openai') {
        const response = await fetch(`${apiUrl || 'https://api.openai.com/v1'}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        return await response.json();
      }

      if (selectedProvider === 'gemini') {
        const baseUrl = apiUrl || 'https://generativelanguage.googleapis.com/v1';
        const response = await fetch(`${baseUrl}/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        return await response.json();
      }

      if (selectedProvider === 'custom' && apiUrl) {
        const response = await fetch(`${apiUrl}/predict`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error(`Custom API error: ${response.status}`);
        }

        return await response.json();
      }

      return null;
    } catch (error: any) {
      console.error('Error calling external API:', error);
      return { error: error.message };
    }
  }

  private parseDurationResponse(response: APIResponse): { minutes: number; confidence: number; factors?: string[] } | null {
    try {
      let content = '';

      // Parse OpenAI response
      if (response.choices && response.choices.length > 0) {
        content = response.choices[0].message?.content || '';
      }

      // Parse Gemini response
      if (response.candidates && response.candidates.length > 0) {
        content = response.candidates[0].content?.parts?.[0]?.text || '';
      }

      // Parse custom API response
      if (response.predictions && response.predictions.length > 0) {
        content = response.predictions[0];
      }

      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          minutes: Math.max(1, Math.round(parsed.minutes || 30)),
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
          factors: parsed.factors || [],
        };
      }

      // Fallback: try to extract just the number
      const numberMatch = content.match(/(\d+)/);
      if (numberMatch) {
        return {
          minutes: Math.max(1, Math.round(parseInt(numberMatch[1]))),
          confidence: 0.6,
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing duration response:', error);
      return null;
    }
  }

  dispose(): void {
    this.models.forEach(model => model.dispose());
    this.models.clear();
    this.isInitialized = false;
  }
}