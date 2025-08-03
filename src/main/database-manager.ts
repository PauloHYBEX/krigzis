// Gerenciador de banco de dados que usa apenas MemoryDatabase
import MemoryDatabase from '../shared/database/memory-db';
import { Note, CreateNoteData, UpdateNoteData, NoteStats } from '../shared/types/note';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'backlog' | 'esta_semana' | 'hoje' | 'concluido';
  priority: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  linkedNoteId?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'backlog' | 'esta_semana' | 'hoje' | 'concluido';
  priority?: number;
  linkedNoteId?: number;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private database: MemoryDatabase;
  private databaseType: string = 'memory';

  private constructor() {
    // Usar apenas MemoryDatabase para evitar problemas com SQLite
    this.database = MemoryDatabase.getInstance();
    this.databaseType = 'memory';
    console.log('✅ Using Memory Database (file-based persistence)');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.database.initialize();
      console.log(`✅ ${this.databaseType} database initialized successfully`);
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Métodos de Tarefas
  public async getAllTasks(): Promise<Task[]> {
    return await this.database.getAllTasks();
  }

  public async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.database.getTasksByStatus(status);
  }

  public async createTask(taskData: CreateTaskData): Promise<Task> {
    return await this.database.createTask(taskData);
  }

  public async updateTask(id: number, updates: Partial<CreateTaskData>): Promise<Task> {
    return await this.database.updateTask(id, updates);
  }

  public async deleteTask(id: number): Promise<boolean> {
    return await this.database.deleteTask(id);
  }

  public async getTaskStats(): Promise<{
    total: number;
    backlog: number;
    esta_semana: number;
    hoje: number;
    concluido: number;
  }> {
    return await this.database.getTaskStats();
  }

  // Métodos de Notas
  public async getAllNotes(): Promise<Note[]> {
    return await this.database.getAllNotes();
  }

  public async getNoteById(id: number): Promise<Note | null> {
    return await this.database.getNoteById(id);
  }

  public async createNote(noteData: CreateNoteData): Promise<Note> {
    return await this.database.createNote(noteData);
  }

  public async updateNote(id: number, updates: UpdateNoteData): Promise<Note> {
    return await this.database.updateNote(id, updates);
  }

  public async deleteNote(id: number): Promise<boolean> {
    return await this.database.deleteNote(id);
  }

  public async getNoteStats(): Promise<NoteStats> {
    return await this.database.getNoteStats();
  }

  public async linkNoteToTask(noteId: number, taskId: number): Promise<void> {
    return await this.database.linkNoteToTask(noteId, taskId);
  }

  public async unlinkNoteFromTask(noteId: number): Promise<void> {
    return await this.database.unlinkNoteFromTask(noteId);
  }

  // Métodos de utilidade
  public async close(): Promise<void> {
    await this.database.close();
    console.log('🔐 Database connection closed');
  }

  public getDatabaseType(): string {
    return this.databaseType;
  }

  public async exportData(): Promise<string> {
    return await this.database.exportData();
  }

  public async importData(jsonData: string): Promise<void> {
    return await this.database.importData(jsonData);
  }

  public async clearAll(): Promise<void> {
    return await this.database.clearAll();
  }

  public async clearAllTasks(): Promise<boolean> {
    try {
      await this.database.clearAll();
      return true;
    } catch (error) {
      console.error('Error clearing all tasks:', error);
      return false;
    }
  }

  // Novos métodos para controle de vínculos
  public async linkTaskToNote(taskId: number, noteId: number): Promise<void> {
    return await this.database.linkTaskToNote(taskId, noteId);
  }

  public async unlinkTaskFromNote(taskId: number): Promise<void> {
    return await this.database.unlinkTaskFromNote(taskId);
  }
}

export default DatabaseManager; 