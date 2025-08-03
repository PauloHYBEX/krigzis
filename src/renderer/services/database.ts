// Serviço para comunicação com o banco de dados via IPC

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'backlog' | 'esta_semana' | 'hoje' | 'concluido';
  priority?: 'low' | 'medium' | 'high';
  category_id?: number;
  linkedNoteId?: number; // Vínculo com nota
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'backlog' | 'esta_semana' | 'hoje' | 'concluido';
  priority?: 'low' | 'medium' | 'high';
  category_id?: number;
  linkedNoteId?: number; // Vínculo com nota
}

export interface TaskStats {
  total: number;
  backlog: number;
  esta_semana: number;
  hoje: number;
  concluido: number;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Verificar se o electron está disponível
  private get electron() {
    return (window as any).electronAPI;
  }

  // Operações de tarefas
  async getAllTasks(): Promise<Task[]> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning mock data');
        return this.getMockTasks();
      }
      return await this.electron.tasks.getAll();
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw error;
    }
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning mock data');
        return this.getMockTasks().filter(task => task.status === status);
      }
      return await this.electron.tasks.getByStatus(status);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      throw error;
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning mock task');
        return this.createMockTask(taskData);
      }
      return await this.electron.tasks.create(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: number, updates: Partial<CreateTaskData>): Promise<Task> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning mock task');
        return this.getMockTasks().find(t => t.id === id) || this.createMockTask(updates);
      }
      return await this.electron.tasks.update(id, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning true');
        return true;
      }
      return await this.electron.tasks.delete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      if (!this.electron) {
        console.warn('Electron API not available, returning mock stats');
        return this.getMockStats();
      }
      return await this.electron.tasks.getStats();
    } catch (error) {
      console.error('Error getting task stats:', error);
      throw error;
    }
  }

  // Métodos auxiliares para desenvolvimento/fallback
  private getMockTasks(): Task[] {
    return [
      {
        id: 1,
        title: 'Configurar projeto',
        description: 'Setup inicial do Electron + React',
        status: 'concluido',
        priority: 'high',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        completed_at: '2024-01-01T11:00:00Z'
      },
      {
        id: 2,
        title: 'Implementar UI base',
        description: 'Criar componentes base e design system',
        status: 'concluido',
        priority: 'medium',
        created_at: '2024-01-02T09:00:00Z',
        updated_at: '2024-01-02T09:00:00Z',
        completed_at: '2024-01-02T17:00:00Z'
      },
      {
        id: 3,
        title: 'Integrar banco de dados',
        description: 'Configurar SQLite e criar schema',
        status: 'hoje',
        priority: 'low',
        created_at: '2024-01-03T08:00:00Z',
        updated_at: '2024-01-03T08:00:00Z'
      },
      {
        id: 4,
        title: 'Criar sistema de tarefas',
        description: 'CRUD completo de tarefas',
        status: 'esta_semana',
        priority: 'medium',
        created_at: '2024-01-04T14:00:00Z',
        updated_at: '2024-01-04T14:00:00Z'
      },
      {
        id: 5,
        title: 'Implementar timer Pomodoro',
        description: 'Cronômetro com notificações',
        status: 'backlog',
        priority: 'high',
        created_at: '2024-01-05T16:00:00Z',
        updated_at: '2024-01-05T16:00:00Z'
      },
      {
        id: 6,
        title: 'Adicionar relatórios',
        description: 'Dashboard com estatísticas',
        status: 'backlog',
        priority: 'low',
        created_at: '2024-01-06T12:00:00Z',
        updated_at: '2024-01-06T12:00:00Z'
      }
    ];
  }

  private getMockStats(): TaskStats {
    const tasks = this.getMockTasks();
    return {
      total: tasks.length,
      backlog: tasks.filter(t => t.status === 'backlog').length,
      esta_semana: tasks.filter(t => t.status === 'esta_semana').length,
      hoje: tasks.filter(t => t.status === 'hoje').length,
      concluido: tasks.filter(t => t.status === 'concluido').length
    };
  }

  private createMockTask(data: CreateTaskData | Partial<CreateTaskData>): Task {
    return {
      id: Math.floor(Math.random() * 1000),
      title: data.title || 'Nova Tarefa',
      description: data.description,
      status: data.status || 'backlog',
      priority: data.priority || 'medium',
      category_id: data.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export default DatabaseService; 