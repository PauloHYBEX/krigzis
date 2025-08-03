import React, { useState, useEffect, useRef } from 'react';
import { Brain, X, Send, Trash2, Minimize2 } from 'lucide-react';
import { useAIConfig } from '../hooks/useAIConfig';
import { useTheme } from '../hooks/useTheme';
import { useDatabase } from '../hooks/useDatabase';
import { useSettings } from '../hooks/useSettings';
import useNotes from '../hooks/useNotes';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isVisible?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isVisible = true }) => {
  const { aiConfig, aiConfigVersion, isAIReady } = useAIConfig();
  const { theme } = useTheme();
  const { tasks, stats } = useDatabase();
  const { notes } = useNotes();
  const { settings } = useSettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Always dark theme
  const isDark = true;

  // Monitor AI config changes for real-time updates using version system like settings
  useEffect(() => {
    const ready = isAIReady();
    console.log('🤖 AIAssistant: AI Ready check:', ready, 'Config enabled:', aiConfig.enabled, 'Version:', aiConfigVersion);
    setAiReady(ready);
  }, [aiConfigVersion, isAIReady]); // Use aiConfigVersion like settings use settingsVersion

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `🤖 Olá! Sou sua assistente IA do Krigzis.\n\nPosso te ajudar com:\n• Análise de produtividade\n• Criação e edição de tarefas\n• Gerenciamento de notas\n• Organização de categorias\n• Sugestões de otimização\n\nO que gostaria de fazer hoje?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const getSystemContext = () => {
    const context = {
      currentDate: new Date().toLocaleDateString('pt-BR'),
      tasksCount: tasks.length,
      notesCount: notes.length,
      stats: stats,
      recentTasks: tasks.slice(0, 5).map(t => ({ id: t.id, title: t.title, status: t.status })),
      recentNotes: notes.slice(0, 3).map(n => ({ id: n.id, title: n.title })),
    };

    return `
CONTEXTO DO SISTEMA KRIGZIS:
- Data atual: ${context.currentDate}
- Total de tarefas: ${context.tasksCount}
- Total de notas: ${context.notesCount}
- Estatísticas: ${JSON.stringify(context.stats)}
- Tarefas recentes: ${JSON.stringify(context.recentTasks)}
- Notas recentes: ${JSON.stringify(context.recentNotes)}

INSTRUÇÕES:
- Você é uma assistente IA especializada no sistema Krigzis
- Responda APENAS sobre funcionalidades do Krigzis
- Seja concisa e útil
- Ofereça ações práticas quando possível
- Use emojis para tornar as respostas mais amigáveis
- Se perguntarem sobre temas externos, redirecione para funcionalidades do Krigzis
`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Debug: verificar configuração da IA
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 AIAssistant: Configuração da IA:', {
        selectedProvider: aiConfig.selectedProvider,
        enabled: aiConfig.enabled,
        isAIReady: isAIReady(),
        settings: {
          aiCanCreateTasks: settings.aiCanCreateTasks,
          aiCanManageNotes: settings.aiCanManageNotes,
          aiCanEditTasks: settings.aiCanEditTasks,
          aiCanDeleteTasks: settings.aiCanDeleteTasks
        }
      });
    }
    
    // Para IA local, permitir sempre que esteja habilitada
    if (aiConfig.selectedProvider !== 'local' && !isAIReady()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await callAI(inputValue);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callAI = async (message: string): Promise<string> => {
    const systemPrompt = getSystemContext();
    
    try {
      // Para IA local, usar sempre se selectedProvider for 'local' ou não definido
      if (!aiConfig.selectedProvider || aiConfig.selectedProvider === 'local') {
        return await callLocalAI(message, systemPrompt);
      }

      // Para outros providers, verificar configuração
      if (!aiConfig || !aiConfig.selectedProvider) {
        return '⚙️ Por favor, configure sua IA nas configurações primeiro.';
      }

      // Prepare the API call based on the selected provider
      let response: string;

      switch (aiConfig.selectedProvider) {
        case 'openai':
          response = await callOpenAI(message, systemPrompt);
          break;
        case 'gemini':
          response = await callGemini(message, systemPrompt);
          break;
        case 'custom':
          response = await callCustomAPI(message, systemPrompt);
          break;
        case 'local':
        default:
          response = await callLocalAI(message, systemPrompt);
          break;
      }

      return response;
    } catch (error) {
      console.error('AI API Error:', error);
      return '❌ Erro ao processar sua solicitação. Verifique sua configuração de IA.';
    }
  };

  // OpenAI API Integration
  const callOpenAI = async (message: string, systemPrompt: string): Promise<string> => {
    if (!aiConfig.apiKey) {
      return '🔑 API Key da OpenAI não configurada. Configure nas configurações.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Erro ao obter resposta da OpenAI.';
  };

  // Google Gemini API Integration
  const callGemini = async (message: string, systemPrompt: string): Promise<string> => {
    if (!aiConfig.apiKey) {
      return '🔑 API Key do Google Gemini não configurada. Configure nas configurações.';
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUsuário: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Details:', errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Erro ao obter resposta do Gemini.';
  };

  // Custom API Integration
  const callCustomAPI = async (message: string, systemPrompt: string): Promise<string> => {
    if (!aiConfig.apiUrl) {
      return '🔗 URL da API personalizada não configurada. Configure nas configurações.';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (aiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
    }

    const response = await fetch(aiConfig.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API Error: ${response.status}`);
    }

    const data = await response.json();
    // Try different response formats
    return data.choices?.[0]?.message?.content || 
           data.response || 
           data.text || 
           'Erro ao obter resposta da API personalizada.';
  };

  // Local AI Processing (Fallback with smart responses and real actions)
  const callLocalAI = async (message: string, systemPrompt: string): Promise<string> => {
    // Debug: verificar mensagem recebida
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 callLocalAI: Mensagem recebida:', message);
      console.log('🔍 callLocalAI: Configurações:', {
        aiCanCreateTasks: settings.aiCanCreateTasks,
        aiCanManageNotes: settings.aiCanManageNotes,
        aiCanEditTasks: settings.aiCanEditTasks,
        aiCanDeleteTasks: settings.aiCanDeleteTasks
      });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerMessage = message.toLowerCase();
    
    // CRIAÇÃO DE TAREFAS - Análise inteligente
    if (lowerMessage.includes('criar') && (lowerMessage.includes('tarefa') || lowerMessage.includes('task'))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 callLocalAI: Detectou criação de tarefa');
      }
      
      if (!settings.aiCanCreateTasks) {
        return `🚫 **Permissão negada**: A criação de tarefas via IA está desabilitada.\n\nPara habilitar, vá em **Configurações > Produtividade > Comportamento da IA** e ative "Permitir criação de tarefas".`;
      }

      // Extrair informações da mensagem
      const taskTitle = extractTaskTitle(message);
      const taskPriority = extractPriority(message);
      const taskStatus = extractStatus(message);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 callLocalAI: Dados extraídos:', { taskTitle, taskPriority, taskStatus });
      }
      
      if (!taskTitle) {
        return `📋 **Criar Nova Tarefa**\n\nPreciso de mais informações:\n\n**Obrigatório:**\n• Título/descrição da tarefa\n\n**Opcional:**\n• Prioridade (baixa, média, alta)\n• Status (backlog, esta_semana, hoje)\n\n**Exemplo:**\n"Criar tarefa: Revisar código do projeto com prioridade alta para hoje"`;
      }

      // Criar a tarefa
      try {
        const newTask = {
          title: taskTitle,
          priority: taskPriority,
          status: taskStatus,
          description: `Criada via IA em ${new Date().toLocaleString()}`,
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 callLocalAI: Tentando criar tarefa:', newTask);
        }

        // Usar a API do sistema para criar a tarefa
        if ((window as any).electronAPI?.database?.createTask) {
          const createdTask = await (window as any).electronAPI.database.createTask(newTask);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ callLocalAI: Tarefa criada:', createdTask);
          }
          
          // Disparar evento para atualizar a UI
          window.dispatchEvent(new CustomEvent('tasksUpdated'));
          
          // Aguardar um pouco para garantir que a UI foi atualizada
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('tasksUpdated'));
          }, 100);
          
          return `✅ **Tarefa criada com sucesso!**\n\n📋 **${taskTitle}**\n• Prioridade: ${taskPriority}\n• Status: ${getStatusName(taskStatus)}\n• ID: #${createdTask.id}\n\nA tarefa foi adicionada ao seu sistema e já está visível no dashboard.`;
        } else {
          return `❌ **Erro**: Sistema de tarefas não disponível. Tente criar manualmente pelo dashboard.`;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ callLocalAI: Erro ao criar tarefa:', error);
        }
        return `❌ **Erro ao criar tarefa**: ${error}`;
      }
    }

    // CRIAÇÃO DE NOTAS - Análise inteligente  
    if (lowerMessage.includes('criar') && (lowerMessage.includes('nota') || lowerMessage.includes('anotação'))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 callLocalAI: Detectou criação de nota');
      }
      
      if (!settings.aiCanManageNotes) {
        return `🚫 **Permissão negada**: O gerenciamento de notas via IA está desabilitado.\n\nPara habilitar, vá em **Configurações > Produtividade > Comportamento da IA** e ative "Permitir gerenciamento de notas".`;
      }

      const noteTitle = extractNoteTitle(message);
      const noteContent = extractNoteContent(message);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 callLocalAI: Dados da nota extraídos:', { noteTitle, noteContent });
      }

      if (!noteTitle) {
        return `📝 **Criar Nova Nota**\n\nPreciso de mais informações:\n\n**Obrigatório:**\n• Título da nota\n\n**Opcional:**\n• Conteúdo inicial\n• Tags (separadas por vírgula)\n\n**Exemplo:**\n"Criar nota: Ideias para projeto com conteúdo: Lista de funcionalidades importantes"`;
      }

      try {
        const newNote = {
          title: noteTitle,
          content: noteContent || `Nota criada via IA em ${new Date().toLocaleString()}`,
          tags: extractTags(message),
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 callLocalAI: Tentando criar nota:', newNote);
        }

        if ((window as any).electronAPI?.database?.createNote) {
          const createdNote = await (window as any).electronAPI.database.createNote(newNote);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ callLocalAI: Nota criada:', createdNote);
          }
          
          return `✅ **Nota criada com sucesso!**\n\n📝 **${noteTitle}**\n• Conteúdo: ${noteContent ? 'Adicionado' : 'Vazio (pode editar depois)'}\n• ID: #${createdNote.id}\n\nA nota foi salva e está disponível na seção de notas.`;
        } else {
          return `❌ **Erro**: Sistema de notas não disponível.`;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ callLocalAI: Erro ao criar nota:', error);
        }
        return `❌ **Erro ao criar nota**: ${error}`;
      }
    }

    // EDIÇÃO DE TAREFAS
    if ((lowerMessage.includes('editar') || lowerMessage.includes('alterar') || lowerMessage.includes('modificar')) && lowerMessage.includes('tarefa')) {
      if (!settings.aiCanEditTasks) {
        return `🚫 **Permissão negada**: A edição de tarefas via IA está desabilitada.\n\nPara habilitar, vá em **Configurações > Produtividade > Comportamento da IA**.`;
      }
      
      return `✏️ **Editar Tarefa**\n\nPara editar uma tarefa, preciso:\n\n1. **ID ou título** da tarefa existente\n2. **O que alterar** (título, prioridade, status, descrição)\n\n**Exemplo:**\n"Editar tarefa #5: alterar prioridade para alta"\n"Modificar tarefa 'Revisar código': mover para hoje"`;
    }

    // EXCLUSÃO DE TAREFAS
    if ((lowerMessage.includes('excluir') || lowerMessage.includes('deletar') || lowerMessage.includes('remover')) && lowerMessage.includes('tarefa')) {
      if (!settings.aiCanDeleteTasks) {
        return `🚫 **Permissão negada**: A exclusão de tarefas via IA está desabilitada por segurança.\n\nPara habilitar, vá em **Configurações > Produtividade > Comportamento da IA**.`;
      }
      
      return `🗑️ **Excluir Tarefa**\n\n⚠️ **Atenção**: Esta ação é irreversível!\n\nPara excluir, preciso:\n• **ID ou título exato** da tarefa\n\n**Exemplo:**\n"Excluir tarefa #5"\n"Deletar tarefa 'Revisar código'"`;
    }

    // ANÁLISE DE PRODUTIVIDADE
    if (lowerMessage.includes('produtividade') || lowerMessage.includes('análise') || lowerMessage.includes('relatório')) {
      const completedTasks = tasks.filter(t => t.status === 'concluido').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const todayTasks = tasks.filter(t => t.status === 'hoje').length;
      const weekTasks = tasks.filter(t => t.status === 'esta_semana').length;
      
      return `📊 **Análise de Produtividade**\n\n**📈 Estatísticas Gerais:**\n• Tarefas totais: ${totalTasks}\n• Concluídas: ${completedTasks}\n• Taxa de conclusão: ${completionRate}%\n\n**📅 Status Atual:**\n• Para hoje: ${todayTasks} tarefas\n• Esta semana: ${weekTasks} tarefas\n• Backlog: ${tasks.filter(t => t.status === 'backlog').length} tarefas\n\n**💡 Insights:**\n${getProductivityInsight(completionRate, todayTasks)}\n\n**🎯 Sugestão:**\n${getProductivitySuggestion(completionRate, todayTasks, weekTasks)}`;
    }

    // INFORMAÇÕES SOBRE NOTAS
    if (lowerMessage.includes('nota') && !lowerMessage.includes('criar')) {
      return `📝 **Suas Notas**\n\n• **Total**: ${notes.length} notas\n• **Recursos**: Suporte a Markdown, tags, vinculação com tarefas\n• **Organização**: Por data, tags ou busca\n\n**Comandos disponíveis:**\n• "Criar nota: [título]"\n• "Listar notas"\n• "Buscar nota: [termo]"\n\n${notes.length === 0 ? '💡 **Dica**: Comece criando sua primeira nota!' : `📋 **Últimas notas**: ${notes.slice(0, 3).map(n => n.title).join(', ')}`}`;
    }

    // AJUDA E COMANDOS
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('comandos')) {
      return `🤖 **Assistente IA - Comandos Disponíveis**\n\n**📋 Tarefas:**\n• "Criar tarefa: [título]"\n• "Editar tarefa #[id]: [alteração]"\n• ${settings.aiCanDeleteTasks ? '"Excluir tarefa #[id]"' : '❌ Exclusão desabilitada'}\n\n**📝 Notas:**\n• "Criar nota: [título]"\n• "Listar notas"\n\n**📊 Análise:**\n• "Analisar produtividade"\n• "Relatório de tarefas"\n\n**⚙️ Sistema:**\n• "Configurações"\n• "Status do sistema"\n\n**💡 Dica**: Seja específico nas solicitações para melhores resultados!`;
    }

    // CONFIGURAÇÕES DO SISTEMA
    if (lowerMessage.includes('configurar') || lowerMessage.includes('config') || lowerMessage.includes('sistema')) {
      return `⚙️ **Status do Sistema**\n\n**🤖 IA:**\n• Provedor: ${aiConfig.selectedProvider || 'Local'}\n• Status: ${isAIReady() ? '✅ Ativa' : '❌ Inativa'}\n• Permissões: ${settings.aiCanCreateTasks ? '✅' : '❌'} Criar | ${settings.aiCanEditTasks ? '✅' : '❌'} Editar | ${settings.aiCanDeleteTasks ? '✅' : '❌'} Excluir\n\n**🎨 Interface:**\n• Tema: ${theme.mode === 'dark' ? '🌙 Escuro' : '☀️ Claro'}\n• Notificações: ${settings?.showNotifications ? '✅ Ativas' : '❌ Inativas'}\n\n**📊 Dados:**\n• Tarefas: ${tasks.length}\n• Notas: ${notes.length}\n\n**⚙️ Para configurações avançadas**: Menu Configurações → Produtividade`;
    }

    // RESPOSTA GENÉRICA INTELIGENTE
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 callLocalAI: Usando resposta genérica para:', message);
    }
    
    return `🤖 **Entendi sua mensagem**: "${message}"\n\n**Posso ajudar com:**\n\n• 📋 **Criar tarefas**: "Criar tarefa: [descrição]"\n• 📝 **Gerenciar notas**: "Criar nota: [título]"\n• 📊 **Análise**: "Analisar produtividade"\n• ❓ **Ajuda**: "Ajuda" ou "Comandos"\n\n**💡 Dica**: Seja específico sobre o que precisa para que eu possa executar a ação correta!`;
  };

  // Funções auxiliares para extração de informações
  const extractTaskTitle = (message: string): string => {
    const patterns = [
      /criar\s+tarefa:?\s*(.+?)(?:\s+com\s+prioridade|\s+para|\s+status|$)/i,
      /tarefa:?\s*(.+?)(?:\s+com\s+prioridade|\s+para|\s+status|$)/i,
      /nova\s+tarefa:?\s*(.+?)(?:\s+com\s+prioridade|\s+para|\s+status|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const extractPriority = (message: string): 'low' | 'medium' | 'high' => {
    if (/prioridade\s+(alta|high)/i.test(message)) return 'high';
    if (/prioridade\s+(baixa|low)/i.test(message)) return 'low';
    return 'medium';
  };

  const extractStatus = (message: string): 'backlog' | 'esta_semana' | 'hoje' | 'concluido' => {
    if (/para\s+(hoje|today)/i.test(message)) return 'hoje';
    if (/para\s+(esta\s+semana|this\s+week)/i.test(message)) return 'esta_semana';
    if (/status\s+(concluido|done|completed)/i.test(message)) return 'concluido';
    return 'backlog';
  };

  const extractNoteTitle = (message: string): string => {
    const patterns = [
      /criar\s+nota:?\s*(.+?)(?:\s+com\s+conteúdo|\s+tags|$)/i,
      /nota:?\s*(.+?)(?:\s+com\s+conteúdo|\s+tags|$)/i,
      /nova\s+nota:?\s*(.+?)(?:\s+com\s+conteúdo|\s+tags|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const extractNoteContent = (message: string): string => {
    const match = message.match(/com\s+conteúdo:?\s*(.+?)(?:\s+tags|$)/i);
    return match ? match[1].trim() : '';
  };

  const extractTags = (message: string): string[] => {
    const match = message.match(/tags:?\s*(.+)$/i);
    if (match) {
      return match[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  };

  const getStatusName = (status: string): string => {
    const names = {
      'backlog': 'Backlog',
      'esta_semana': 'Esta Semana',
      'hoje': 'Hoje',
      'concluido': 'Concluído'
    };
    return names[status as keyof typeof names] || status;
  };

  const getProductivityInsight = (completionRate: number, todayTasks: number): string => {
    if (completionRate >= 80) return '🎉 Excelente produtividade! Você está no topo do seu jogo.';
    if (completionRate >= 60) return '👍 Boa produtividade! Continue assim.';
    if (completionRate >= 40) return '📈 Produtividade moderada. Há espaço para melhorias.';
    if (todayTasks > 5) return '⚠️ Muitas tarefas para hoje. Considere redistribuir.';
    return '🚀 Momento de acelerar! Foque nas prioridades.';
  };

  const getProductivitySuggestion = (completionRate: number, todayTasks: number, weekTasks: number): string => {
    if (todayTasks === 0) return 'Mova algumas tarefas para "Hoje" e comece a trabalhar!';
    if (todayTasks > 5) return 'Considere mover algumas tarefas de hoje para "Esta Semana".';
    if (weekTasks === 0) return 'Planeje sua semana movendo tarefas do backlog para "Esta Semana".';
    if (completionRate < 50) return 'Foque em concluir as tarefas atuais antes de criar novas.';
    return 'Continue mantendo o equilíbrio entre planejamento e execução!';
  };

  const clearChat = () => {
    setMessages([]);
    // Re-initialize with welcome message
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-new',
        role: 'assistant',
        content: `🔄 Chat limpo! Como posso te ajudar agora?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  // Verificar se IA está habilitada nas configurações (atualização em tempo real)
  if (!aiReady) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary-teal) 0%, var(--color-primary-purple) 100%)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 212, 170, 0.3)',
              transition: 'all 0.3s ease',
              animation: 'ai-pulse 2s infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 170, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 170, 0.3)';
            }}
            title="Assistente IA"
          >
            <Brain size={24} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMinimized ? '24px' : '24px',
            right: '24px',
            width: isMinimized ? 'auto' : '380px',
            height: isMinimized ? 'auto' : '500px',
            backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
            border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'ai-slide-in 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
            background: 'linear-gradient(135deg, var(--color-primary-teal) 0%, var(--color-primary-purple) 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Brain size={20} strokeWidth={2} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  Assistente IA
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                  {isLoading ? 'Digitando...' : 'Online'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={clearChat}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Limpar conversa"
              >
                <Trash2 size={14} />
              </button>
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <Minimize2 size={14} />
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: message.role === 'user' 
                          ? 'var(--color-primary-teal)' 
                          : isDark ? '#1A1A1A' : '#F3F4F6',
                        color: message.role === 'user' 
                          ? '#FFFFFF' 
                          : isDark ? '#FFFFFF' : '#1F2937',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
                      color: isDark ? '#FFFFFF' : '#1F2937',
                      fontSize: '14px',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                      }}>
                        <div className="ai-typing-dot" style={{ animationDelay: '0ms' }}></div>
                        <div className="ai-typing-dot" style={{ animationDelay: '150ms' }}></div>
                        <div className="ai-typing-dot" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '16px',
                borderTop: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
                backgroundColor: isDark ? '#141414' : '#F9FAFB',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                }}>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
                      backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
                      color: isDark ? '#FFFFFF' : '#1F2937',
                      fontSize: '14px',
                      resize: 'none',
                      outline: 'none',
                      minHeight: '44px',
                      maxHeight: '120px',
                    }}
                    rows={1}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: inputValue.trim() && !isLoading 
                        ? 'var(--color-primary-teal)' 
                        : isDark ? '#2A2A2A' : '#E5E7EB',
                      color: inputValue.trim() && !isLoading 
                        ? '#FFFFFF' 
                        : isDark ? '#666666' : '#9CA3AF',
                      cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(0, 212, 170, 0.3); }
          50% { box-shadow: 0 8px 32px rgba(0, 212, 170, 0.6); }
        }
        
        @keyframes ai-slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .ai-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-primary-teal);
          animation: ai-typing 1.4s infinite ease-in-out;
        }
        
        @keyframes ai-typing {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}; 