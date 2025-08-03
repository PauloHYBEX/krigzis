export type TaskStatus = 'backlog' | 'esta_semana' | 'hoje' | 'concluido';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  workspace_id: number;
  created_at: string;
  updated_at: string;
  isSystem?: boolean; // Para diferenciar categorias padrão das customizadas
  order?: number; // Para ordenação
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  category_id?: number; // Nova propriedade para categoria customizada
  linkedNoteId?: number; // Vínculo com nota
  created_at: string;
  updated_at: string;
  due_date?: string;
  completed_at?: string;
  priority?: TaskPriority;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  category_id?: number;
  linkedNoteId?: number;
  priority?: TaskPriority;
  due_date?: string;
} 