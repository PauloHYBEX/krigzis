import { useState, useEffect, useCallback } from 'react';
import DatabaseService, { Task, CreateTaskData, TaskStats } from '../services/database';

interface UseDatabaseReturn {
  // Estado
  tasks: Task[];
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;

  // Operações
  getAllTasks: () => Promise<void>;
  getTasksByStatus: (status: string) => Promise<Task[]>;
  createTask: (taskData: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: number, updates: Partial<CreateTaskData>) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  
  // Vínculos com notas
  linkTaskToNote: (taskId: number, noteId: number) => Promise<boolean>;
  unlinkTaskFromNote: (taskId: number) => Promise<boolean>;
}

export const useDatabase = (): UseDatabaseReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const databaseService = DatabaseService.getInstance();

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para buscar todas as tarefas
  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allTasks = await databaseService.getAllTasks();
      setTasks(allTasks);
      
      // Disparar evento para notificar que as tarefas foram carregadas
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { loaded: true } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
      console.error('Error in getAllTasks:', err);
    } finally {
      setLoading(false);
    }
  }, [databaseService]);

  // Função para buscar tarefas por status
  const getTasksByStatus = useCallback(async (status: string): Promise<Task[]> => {
    try {
      setError(null);
      return await databaseService.getTasksByStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas por status');
      console.error('Error in getTasksByStatus:', err);
      return [];
    }
  }, [databaseService]);

  // Função para criar tarefa
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await databaseService.createTask(taskData);
      
      // Se há uma nota vinculada, criar o vínculo automaticamente
      if (newTask.linkedNoteId) {
        const electron = (window as any).electronAPI;
        if (electron?.database?.linkTaskToNote) {
          await electron.database.linkTaskToNote(newTask.id, newTask.linkedNoteId);
        }
      }
      
      // Atualizar lista local
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Disparar evento para notificar outras partes do sistema
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: newTask }));
      
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
      console.error('Error in createTask:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [databaseService]);

  // Função para atualizar tarefa
  const updateTask = useCallback(async (id: number, updates: Partial<CreateTaskData>): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await databaseService.updateTask(id, updates);
      
      // Atualizar lista local
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
      
      // Disparar evento para notificar outras partes do sistema
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: updatedTask }));
      
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
      console.error('Error in updateTask:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [databaseService]);

  // Função para deletar tarefa
  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await databaseService.deleteTask(id);
      
      if (success) {
        // Remover da lista local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        
        // Disparar evento para notificar outras partes do sistema
        window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { deletedId: id } }));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar tarefa');
      console.error('Error in deleteTask:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [databaseService]);

  // Função para atualizar estatísticas
  const refreshStats = useCallback(async () => {
    try {
      setError(null);
      const taskStats = await databaseService.getTaskStats();
      setStats(taskStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
      console.error('Error in refreshStats:', err);
    }
  }, [databaseService]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        getAllTasks(),
        refreshStats()
      ]);
    };

    loadInitialData();
  }, [getAllTasks, refreshStats]);

  // Vincular tarefa a nota
  const linkTaskToNote = useCallback(async (taskId: number, noteId: number): Promise<boolean> => {
    try {
      setError(null);
      const electron = (window as any).electronAPI;
      if (electron?.database?.linkTaskToNote) {
        await electron.database.linkTaskToNote(taskId, noteId);
      } else {
        console.warn('linkTaskToNote method not available');
      }
      // Atualizar a lista local para refletir o vínculo
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, linkedNoteId: noteId } : task
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular tarefa à nota');
      console.error('Error in linkTaskToNote:', err);
      return false;
    }
  }, []);

  // Desvincular tarefa de nota
  const unlinkTaskFromNote = useCallback(async (taskId: number): Promise<boolean> => {
    try {
      setError(null);
      const electron = (window as any).electronAPI;
      if (electron?.database?.unlinkTaskFromNote) {
        await electron.database.unlinkTaskFromNote(taskId);
      } else {
        console.warn('unlinkTaskFromNote method not available');
      }
      // Atualizar a lista local para remover o vínculo
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, linkedNoteId: undefined } : task
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desvincular tarefa da nota');
      console.error('Error in unlinkTaskFromNote:', err);
      return false;
    }
  }, []);

  // Atualizar estatísticas sempre que as tarefas mudarem
  useEffect(() => {
    if (tasks.length > 0) {
      refreshStats();
    }
  }, [tasks, refreshStats]);

  return {
    // Estado
    tasks,
    stats,
    loading,
    error,

    // Operações
    getAllTasks,
    getTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    refreshStats,
    clearError,
    
    // Vínculos com notas
    linkTaskToNote,
    unlinkTaskFromNote
  };
};

export default useDatabase; 