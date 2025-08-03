import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CalendarDays, 
  Zap, 
  CheckCircle, 
  Timer, 
  BarChart2, 
  Plus,
  Folder,
  Home,
  BookOpen,
  Briefcase,
  Heart,
  ShoppingCart,
  Target,
  DollarSign,
  Plane,
  Car,
  Music,
  Gamepad2,
  Smartphone,
  Laptop,
  Tv,
  Dumbbell,
  Users,
  Star,
  Flag,
  SettingsIcon,
  GripVertical,
  X,
  Brain,
  ChevronDown,
  ChevronUp,
  LogOut,
  Share2,
  UserX,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { UnifiedCard } from './ui/Card';
import { useTheme } from '../hooks/useTheme';
import { useDatabase } from '../hooks/useDatabase';
import { useI18n } from '../hooks/useI18n';
import { useSettings } from '../hooks/useSettings';
import { useCategories } from '../hooks/useCategories';
import { useAIConfig } from '../hooks/useAIConfig';
import { useNotifications } from '../hooks/useNotifications';
import { useRef } from 'react';


// Mapping de ícones
const iconMap: { [key: string]: React.ComponentType<any> } = {
  ClipboardList,
  CalendarDays,
  Zap,
  CheckCircle,
  Timer,
  BarChart2,
  Folder,
  Home,
  BookOpen,
  Briefcase,
  Heart,
  ShoppingCart,
  Target,
  DollarSign,
  Plane,
  Car,
  Music,
  Gamepad2,
  Smartphone,
  Laptop,
  Tv,
  Dumbbell,
  Users,
  Star,
  Flag
};

// Função para renderizar ícone
const renderIcon = (iconName: string, size: number = 20, color?: string) => {
  const IconComponent = iconMap[iconName] || Folder;
  return <IconComponent size={size} strokeWidth={1.5} color={color} />;
};

// Mapear os status antigos para os novos
const mapStatusToNew = (status: string) => {
  const mapping: { [key: string]: string } = {
    'backlog': 'backlog',
    'week': 'esta_semana', 
    'today': 'hoje',
    'done': 'concluido'
  };
  return mapping[status] || status;
};

interface DashboardProps {
  onViewTaskList: (status: string) => void;
  onOpenTaskModal: () => void;
  onOpenTimer?: () => void;
  onOpenReports?: () => void;
  showQuickActions?: boolean;
  showTaskCounters?: boolean;
  showTimer?: boolean;
}

// Definir tipo para os cards de ação rápida
interface QuickActionCard {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onViewTaskList,
  onOpenTaskModal,
  onOpenTimer,
  onOpenReports,
  showQuickActions = true,
  showTaskCounters = true,
  showTimer = true,
}) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { settings, getGreeting, getEnabledTaskCards, getEnabledQuickActions, updateQuickActions, enableQuickAction, disableQuickAction, reorderQuickActions } = useSettings();
  const { tasks, stats, loading, error, getTasksByStatus, createTask, updateTask, clearError } = useDatabase();
  const { categories, loading: categoriesLoading, error: categoriesError, reloadCategories } = useCategories(tasks);
  const { aiConfig } = useAIConfig();
  const [statusTasks, setStatusTasks] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [taskModalData, setTaskModalData] = useState<any>(null);


  
  const isDark = theme.mode === 'dark';

  // DEBUG: Log todos os estados importantes - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Categories:', categories);
    console.log('CategoriesLoading:', categoriesLoading);
    console.log('CategoriesError:', categoriesError);
    console.log('Tasks:', tasks);
    console.log('Stats:', stats);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Settings:', settings);
    console.log('EnabledTaskCards:', getEnabledTaskCards());
    console.log('EnabledQuickActions:', getEnabledQuickActions());
    console.log('========================');
  }

  // Escutar mudanças nas categorias - optimized
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Categories updated event fired');
      }
      reloadCategories();
    };

    const handleTasksUpdate = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tasks updated event fired');
      }
      // Forçar recarregamento das categorias quando tarefas mudam
      setTimeout(() => {
        reloadCategories();
      }, 200);
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('tasksUpdated', handleTasksUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('tasksUpdated', handleTasksUpdate);
    };
  }, [reloadCategories]);

  // Force o carregamento das categorias quando o componente montar - optimized
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard mounted - forcing categories reload');
    }
    
    // Primeiro, garantir que temos categorias no localStorage
    const ensureDefaultCategories = () => {
      const stored = localStorage.getItem('krigzis_categories');
      if (process.env.NODE_ENV === 'development') {
        console.log('Stored categories:', stored);
      }
      
      if (!stored || stored === '[]' || stored === 'null') {
        if (process.env.NODE_ENV === 'development') {
          console.log('No categories found, creating default ones');
        }
        const defaultCategories = [
          {
            id: 1,
            name: 'Backlog',
            color: '#6B7280',
            icon: 'ClipboardList',
            isSystem: true,
            order: 1,
            workspace_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Esta Semana',
            color: '#3B82F6',
            icon: 'CalendarDays',
            isSystem: true,
            order: 2,
            workspace_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Hoje',
            color: '#F59E0B',
            icon: 'Zap',
            isSystem: true,
            order: 3,
            workspace_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 4,
            name: 'Concluído',
            color: '#10B981',
            icon: 'CheckCircle',
            isSystem: true,
            order: 4,
            workspace_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('krigzis_categories', JSON.stringify(defaultCategories));
        if (process.env.NODE_ENV === 'development') {
          console.log('Default categories saved:', defaultCategories);
        }
      }
    };

    ensureDefaultCategories();

    // Depois, recarregar as categorias
    const timer1 = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Triggering categories reload');
      }
      reloadCategories();
    }, 100);
    
    // Força uma segunda tentativa se as categorias estiverem vazias
    const timer2 = setTimeout(() => {
      if (categories.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Second attempt - forcing categories reload');
        }
        reloadCategories();
      }
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []); // Remove reloadCategories from dependencies to prevent infinite loops

  const getGreetingText = () => {
    const greetingKey = getGreeting();
    return t(greetingKey, { name: settings.userName });
  };

  const getTotalTasks = () => {
    if (!stats) return 0;
    return stats.backlog + stats.esta_semana + stats.hoje;
  };

  const getTodayTasks = () => {
    if (!stats) return 0;
    return stats.hoje;
  };

  const getCompletionRate = () => {
    if (!stats) return 0;
    const total = stats.total;
    if (total === 0) return 0;
    return Math.round((stats.concluido / total) * 100);
  };

  // CORREÇÃO: Sempre garantir que as categorias padrão sejam exibidas
  // Obter os task cards habilitados das configurações como fallback
  const enabledTaskCards = getEnabledTaskCards();
  
  // Fallback robusto: sempre garantir que há categorias para exibir
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  let displayCards: any[] = [];

  if (hasCategories) {
    // Categorias do sistema
    const systemCards = categories
      .filter(cat => cat.isSystem)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(category => {
      const statusMap: { [key: string]: string } = {
        'Backlog': 'backlog',
        'Esta Semana': 'esta_semana',
        'Hoje': 'hoje',
        'Concluído': 'concluido'
      };
      const status = statusMap[category.name] || category.name.toLowerCase();
      const count = stats?.[status as keyof typeof stats] || 0;
      return {
        key: status,
        categoryId: category.id,
        title: category.name,
        desc: `${count} ${count === 1 ? 'tarefa' : 'tarefas'}`,
        count: count,
        icon: category.icon || 'Folder',
        accentColor: category.color,
        isSystem: true
      };
    });
    // Categorias customizadas
    const customCards = categories
    .filter(cat => !cat.isSystem)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(category => {
      console.log('🔍 Dashboard: Processando categoria customizada:', category);
      return {
      key: `category_${category.id}`,
      categoryId: category.id,
      title: category.name,
      desc: `${category.task_count || 0} ${category.task_count === 1 ? 'tarefa' : 'tarefas'}`,
      count: category.task_count || 0,
      icon: category.icon || 'Folder',
      accentColor: category.color,
      isSystem: false
      };
    });
    
    console.log('🔍 Dashboard: Categorias customizadas encontradas:', customCards.length);
    displayCards = [...systemCards, ...customCards];
  } else {
    // Fallback: categorias padrão
    displayCards = [
    {
      key: 'backlog',
      categoryId: 1,
      title: 'Backlog',
      desc: `${stats?.backlog || 0} tarefas`,
      count: stats?.backlog || 0,
      icon: 'ClipboardList',
      accentColor: '#6B7280',
      isSystem: true
    },
    {
      key: 'esta_semana',
      categoryId: 2,
      title: 'Esta Semana',
      desc: `${stats?.esta_semana || 0} tarefas`,
      count: stats?.esta_semana || 0,
      icon: 'CalendarDays',
      accentColor: '#3B82F6',
      isSystem: true
    },
    {
      key: 'hoje',
      categoryId: 3,
      title: 'Hoje',
      desc: `${stats?.hoje || 0} tarefas`,
      count: stats?.hoje || 0,
      icon: 'Zap',
      accentColor: '#F59E0B',
      isSystem: true
    },
    {
      key: 'concluido',
      categoryId: 4,
      title: 'Concluído',
      desc: `${stats?.concluido || 0} tarefas`,
      count: stats?.concluido || 0,
      icon: 'CheckCircle',
      accentColor: '#10B981',
      isSystem: true
    }
  ];
    if (process.env.NODE_ENV === 'development') {
      console.warn('Dashboard fallback: exibindo categorias padrão. Verifique o hook useCategories ou o localStorage.');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Final displayCards:', displayCards);
  }

  const quickActionMap: Record<string, QuickActionCard> = {
    timer: {
      key: 'timer',
      title: 'Timer',
      desc: 'Sessões focadas',
      icon: <Timer size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #00D4AA 0%, #7B3FF2 100%)',
      onClick: onOpenTimer
    },
    reports: {
      key: 'reports',
      title: 'Relatórios',
      desc: 'Análise',
      icon: <BarChart2 size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #ffb199 0%, #ff0844 100%)',
      onClick: onOpenReports
    },
    newTask: {
      key: 'newTask',
      title: 'Nova Tarefa',
      desc: 'Criar tarefa',
      icon: <Plus size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #7B3FF2 0%, #00D4AA 100%)',
      onClick: onOpenTaskModal
    },
    categories: {
      key: 'categories',
      title: 'Categorias',
      desc: 'Gerenciar',
      icon: <Folder size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('openCategoryManager'))
    },
    backup: {
      key: 'backup',
      title: 'Backup',
      desc: 'Exportar dados',
      icon: <Download size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('exportData'))
    },
    import: {
      key: 'import',
      title: 'Importar',
      desc: 'Restaurar dados',
      icon: <Upload size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('importData'))
    },
    clearData: {
      key: 'clearData',
      title: 'Limpar',
      desc: 'Apagar dados',
      icon: <Trash2 size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('clearAllData'))
    },
    profile: {
      key: 'profile',
      title: 'Perfil',
      desc: 'Usuário',
      icon: <Users size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('openProfile'))
    },
    share: {
      key: 'share',
      title: 'Compartilhar',
      desc: 'Exportar',
      icon: <Share2 size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('shareData'))
    },
    logout: {
      key: 'logout',
      title: 'Sair',
      desc: 'Desconectar',
      icon: <LogOut size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('logout'))
    },
    ...(settings.showNotes && {
      notes: {
        key: 'notes',
        title: 'Notas',
        desc: 'Anotações',
        icon: <BookOpen size={16} strokeWidth={1.5} />,
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #7B3FF2 100%)',
        onClick: () => window.dispatchEvent(new CustomEvent('openNotes'))
      },
      newNote: {
        key: 'newNote',
        title: 'Nova Nota',
        desc: 'Criar nota',
        icon: <Plus size={16} strokeWidth={1.5} />,
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)',
        onClick: () => window.dispatchEvent(new CustomEvent('openNewNote'))
      }
    }),
    settings: {
      key: 'settings',
      title: 'Config',
      desc: 'Configurações',
      icon: <SettingsIcon size={16} strokeWidth={1.5} />,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #00D4AA 100%)',
      onClick: () => window.dispatchEvent(new CustomEvent('openSettings'))
    }
  };
  const enabledQuickActions = getEnabledQuickActions();
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadStatusTasks = async (status: string) => {
    try {
      const tasks = await getTasksByStatus(status);
      setStatusTasks(tasks);
      setSelectedStatus(status);
    } catch (error) {
      console.error('Error loading status tasks:', error);
    }
  };

  const handleCreateSampleTask = async () => {
    const sampleTasks = [
      { title: '📝 Revisar código do projeto', status: 'hoje' as const, priority: 'medium' as const },
      { title: '🎯 Preparar apresentação', status: 'esta_semana' as const, priority: 'high' as const },
      { title: '📚 Estudar novas tecnologias', status: 'backlog' as const, priority: 'low' as const },
      { title: '🗂️ Organizar workspace', status: 'hoje' as const, priority: 'low' as const }
    ];

    const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
    await createTask(randomTask);
  };

  const handleCompleteTask = async (taskId: number) => {
    await updateTask(taskId, { 
      status: 'concluido'
    });
    
    if (selectedStatus) {
      loadStatusTasks(selectedStatus);
    }
  };

  const closeTaskModal = () => {
    setSelectedStatus(null);
    setStatusTasks([]);
  };

  const allQuickActions = [
    'timer', 'reports', 'newTask', 'categories', 'backup', 'import', 'clearData', 'profile', 'share', 'logout',
    ...(settings.showNotes ? ['notes', 'newNote'] : []), 
    'settings'
  ];

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function handleDragStart(idx: number) {
    setDraggedIdx(idx);
  }
  function handleDragOver(idx: number) {
    setDragOverIdx(idx);
  }
  function handleDrop() {
    if (draggedIdx === null || dragOverIdx === null || draggedIdx === dragOverIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const current = [...settings.quickActions];
    const [removed] = current.splice(draggedIdx, 1);
    current.splice(dragOverIdx, 0, removed);
    // Corrige ordem
    current.forEach((a, i) => a.order = i + 1);
    updateQuickActions(current);
    setDraggedIdx(null);
    setDragOverIdx(null);
  }
  function handleToggleAction(key: string) {
    // Verificar se a funcionalidade correspondente está habilitada nos parâmetros
    const isFeatureEnabled = checkFeatureEnabled(key);
    
    if (!isFeatureEnabled) {
      // Mostrar toast em vez de alert
      setToastMessage('⚠️ Habilitar parâmetro nas configurações antes de ativar esta funcionalidade');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    
    const updated = settings.quickActions.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a);
    updateQuickActions(updated);
  }
  
  // Função para verificar se a funcionalidade está habilitada
  function checkFeatureEnabled(key: string): boolean {
    switch (key) {
      case 'timer':
        return settings.showTimer || false;
      case 'reports':
        return settings.showReports || false;
      case 'notes':
      case 'newNote':
        return settings.showNotes || false;
      case 'newTask':
      case 'settings':
      case 'categories':
      case 'backup':
      case 'import':
      case 'clearData':
      case 'profile':
      case 'share':
      case 'logout':
        return true; // Essas são sempre disponíveis
      default:
        return true;
    }
  }
  function handleCloseModal() {
    setShowQuickActionsModal(false);
    setDraggedIdx(null);
    setDragOverIdx(null);
  }



  return (
    <div className="dashboard-container" style={{ padding: 'var(--space-4)' }}>
      {/* Header Section */}
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 className="gradient-text" style={{ 
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-1)',
              lineHeight: 'var(--line-height-tight)'
            }}>
              {getGreetingText()}
            </h1>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: isDark ? 'var(--color-text-secondary)' : '#666666',
              margin: 0
            }}>
              {t('subtitle')} Você tem {getTodayTasks()} {getTodayTasks() === 1 ? t('task') : t('tasks')} para hoje.
            </p>
          </div>
          
          <div className="flex" style={{ gap: 'var(--space-3)' }}>
            <Card variant="glass" padding="sm">
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary-teal)',
                  marginBottom: 0
                }}>
                  {getCompletionRate()}%
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: isDark ? 'var(--color-text-muted)' : '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Progresso
                </div>
              </div>
            </Card>
          </div>
        </div>
      </header>

      {/* Quick Actions - Grid Unificado */}
      {showQuickActions && (
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
          {t('quickActions')}
        </h2>
            <button onClick={() => setShowQuickActionsModal(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-teal)', fontSize: 18, cursor: 'pointer', padding: 2, borderRadius: 6, transition: 'background 0.2s' }} title="Adicionar/Editar Ação Rápida">
              <Plus />
            </button>
                </div>
          {enabledQuickActions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-secondary)', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span>Adicionar ação rápida</span>
              <button onClick={() => setShowQuickActionsModal(true)} style={{ background: 'var(--color-primary-teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4, cursor: 'pointer' }}>
                <Plus />
              </button>
                </div>
          ) : (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 6, padding: 0 }}>
              {enabledQuickActions.map(action => {
                const card = quickActionMap[action.key];
                if (!card || !card.icon) return null;
                return (
                  <UnifiedCard
                    key={card.key}
                    icon={card.icon || <Folder size={16} />}
                    title={card.title}
                    accentColor={card.gradient ? undefined : 'var(--color-primary-teal)'}
                    style={card.gradient ? { background: card.gradient } : {}}
                    onCardClick={card.onClick}
                    compact
                  />
                );
              })}
          </div>
        )}
          {showQuickActionsModal && (
            <div 
              className="quick-actions-modal"
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(2px)'
              }}
              onClick={handleCloseModal}
            >
              <div 
            style={{
                  background: isDark ? '#1a1a1d' : '#fff',
                  borderRadius: 16, minWidth: 340, maxWidth: 420, width: '90%',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  padding: 28, position: 'relative',
                  display: 'flex', flexDirection: 'column', gap: 16,
                  border: `1px solid ${isDark ? '#2a2a2d' : '#e5e7eb'}`,
                  animation: 'fadeIn 0.2s ease-out',
                  maxHeight: '80vh', // Limite de altura
                  overflowY: 'auto', // Rolagem interna
                }}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={handleCloseModal} 
                  style={{ 
                    position: 'absolute', top: 16, right: 16, 
                    background: 'none', border: 'none', 
                    color: 'var(--color-text-secondary)', 
                    fontSize: 18, cursor: 'pointer',
                    borderRadius: 6, padding: 4,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-bg-hover)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <X />
          </button>
                  <h3 style={{
                  fontSize: 20, fontWeight: 600, margin: 0, 
                  color: 'var(--color-text-primary)'
                  }}>
                  Gerenciar Ações Rápidas
                  </h3>
                  <p style={{
                  fontSize: 14, color: 'var(--color-text-secondary)',
                  margin: '-8px 0 8px 0'
                }}>
                  Arraste para reordenar, marque para ativar
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {settings.quickActions
                    .sort((a, b) => a.order - b.order)
                    .map((action, idx) => {
                      const card = quickActionMap[action.key];
                      if (!card) return null;
                      const isDragging = draggedIdx === idx;
                      const isDragOver = dragOverIdx === idx;
            return (
              <div
                          key={action.key}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
                          onDrop={handleDrop}
                          onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                          className={`quick-actions-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                            background: isDragging ? 'var(--color-primary-teal)' : isDragOver ? 'rgba(0,212,170,0.1)' : (isDark ? '#252528' : '#f9fafb'),
                            borderRadius: 10, cursor: 'grab',
                            border: `1px solid ${isDragOver ? 'var(--color-primary-teal)' : (isDark ? '#333336' : '#e5e7eb')}`,
                            opacity: isDragging ? 0.8 : (action.enabled ? 1 : 0.6),
                            transform: isDragging ? 'scale(0.98)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ cursor: 'grab', color: 'var(--color-text-muted)' }}>
                            <GripVertical size={16} />
                          </span>
                          <input 
                            type="checkbox" 
                            checked={action.enabled} 
                            onChange={() => handleToggleAction(action.key)}
                            disabled={!checkFeatureEnabled(action.key)}
                            style={{ 
                              width: 18, height: 18, 
                              cursor: checkFeatureEnabled(action.key) ? 'pointer' : 'not-allowed',
                              accentColor: 'var(--color-primary-teal)',
                              opacity: checkFeatureEnabled(action.key) ? 1 : 0.5
                            }}
                          />
                          <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>
                            {card.icon}
                          </span>
                          <span style={{ 
                            fontWeight: 500, fontSize: 15, flex: 1,
                            color: 'var(--color-text-primary)'
                  }}>
                    {card.title}
                          </span>
                          {!checkFeatureEnabled(action.key) && (
                            <span 
                              style={{ 
                                fontSize: 12, 
                                color: 'var(--color-accent-amber)', 
                                fontWeight: 500,
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                padding: '2px 6px',
                                borderRadius: 4
                              }}
                              title="Habilitar parâmetro nas configurações antes"
                            >
                              ⚠️ Desabilitado
                            </span>
                          )}
              </div>
            );
          })}
        </div>
                <button 
                  onClick={handleCloseModal} 
          style={{
                    marginTop: 8, background: 'var(--color-primary-teal)', 
                    color: '#fff', border: 'none', borderRadius: 10, 
                    fontWeight: 600, fontSize: 15, padding: '12px 0', 
                    cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,212,170,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
          }}
        >
                  Salvar
                </button>
      </div>
            </div>
          )}
      </section>
      )}

      {/* Categorias - Grid Unificado */}
      <section>
        <h2 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)',
          margin: '0 0 var(--space-3) 0'
        }}>
          {t('categories')}
        </h2>
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          padding: 0
        }}>
          {displayCards.map((card) => (
            <UnifiedCard
                key={card.key}
              icon={renderIcon(card.icon, 20, card.accentColor)}
              title={card.title}
              count={showTaskCounters ? card.count : undefined}
              accentColor={card.accentColor}
              onCardClick={() => onViewTaskList(card.key)}
            />
          ))}
        </div>
      </section>

      {/* Modal de Detalhes do Status */}
      {selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeTaskModal}>
          <div 
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {displayCards.find(c => c.key === selectedStatus)?.title} - Tarefas
                </h2>
                <Button variant="ghost" onClick={closeTaskModal}>
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {statusTasks.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhuma tarefa encontrada para este status.
                </p>
              ) : (
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/70 transition-colors"
                    >
                      <div>
                        <h3 className="text-white font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            Prioridade {task.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {selectedStatus !== 'concluido' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast para feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-primary)',
          borderLeft: '4px solid #F59E0B',
          borderRadius: '8px',
          padding: '12px 16px',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          color: 'var(--color-text-primary)',
          fontSize: '14px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}; 