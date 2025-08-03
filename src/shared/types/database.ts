// Tipos base para o sistema de dados

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Usuário (para colaboração futura)
export interface User extends BaseEntity {
  username: string;
  email?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface CreateUserData {
  username: string;
  email?: string;
  avatar_url?: string;
  is_active?: boolean;
}

// Workspace (para colaboração)
export interface Workspace extends BaseEntity {
  name: string;
  description?: string;
  owner_id: number;
  is_shared: boolean;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  owner_id: number;
  is_shared?: boolean;
}

// Status das tarefas
export type TaskStatus = 'backlog' | 'esta_semana' | 'hoje' | 'concluido';

// Prioridades das tarefas (1 = alta, 5 = baixa)
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

// Tarefa
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  workspace_id: number;
  assigned_to?: number;
  created_by: number;
  estimated_time?: number; // em minutos
  actual_time?: number;    // em minutos
  due_date?: string;
  completed_at?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workspace_id: number;
  assigned_to?: number;
  created_by: number;
  estimated_time?: number;
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  estimated_time?: number;
  actual_time?: number;
  due_date?: string;
  completed_at?: string;
}

// Categoria
export interface Category extends BaseEntity {
  name: string;
  color: string;
  icon?: string;
  workspace_id: number;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  icon?: string;
  workspace_id: number;
}

// Sessão de Timer
export type TimerSessionType = 'work' | 'break' | 'long_break';

export interface TimerSession extends BaseEntity {
  task_id?: number;
  duration: number; // em segundos
  session_type: TimerSessionType;
  started_at: string;
  ended_at?: string;
  completed: boolean;
  workspace_id: number;
}

export interface CreateTimerSessionData {
  task_id?: number;
  duration: number;
  session_type?: TimerSessionType;
  started_at: string;
  workspace_id: number;
}

// Configurações do sistema
export interface Setting {
  key: string;
  value: string;
  user_id?: number;
  workspace_id?: number;
}

export interface CreateSettingData {
  key: string;
  value: string;
  user_id?: number;
  workspace_id?: number;
}

// Filtros para queries
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigned_to?: number[];
  workspace_id?: number;
  created_by?: number;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Estatísticas do Dashboard
export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  today_tasks: number;
  this_week_tasks: number;
  completion_rate: number;
  average_completion_time: number; // em minutos
  most_productive_hour: number;
  total_time_tracked: number; // em minutos
}

// Dados para relatórios
export interface ProductivityReport {
  date: string;
  tasks_completed: number;
  time_tracked: number; // em minutos
  sessions_count: number;
  efficiency_score: number; // 0-100
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  daily_reports: ProductivityReport[];
  total_tasks: number;
  total_time: number;
  average_efficiency: number;
} 