// Banco de dados em memória com persistência em arquivo JSON
import fs from 'fs';
import path from 'path';
import { Note, CreateNoteData, UpdateNoteData, NoteStats, NoteAttachment } from '../types/note';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'backlog' | 'esta_semana' | 'hoje' | 'concluido';
  priority: number;
  category_id?: number;
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
  category_id?: number;
  linkedNoteId?: number;
}

class MemoryDatabase {
  private static instance: MemoryDatabase;
  private tasks: Task[] = [];
  private notes: Note[] = [];
  private nextTaskId = 1;
  private nextNoteId = 1;
  private isInitialized = false;
  private dataPath: string;

  private constructor() {
    // Usar o diretório de dados do usuário ou fallback para o diretório atual
    const userDataPath = process.env.APPDATA || process.env.HOME || process.cwd();
    const dataDir = path.join(userDataPath, 'Krigzis', 'data');
    this.dataPath = path.join(dataDir, 'memory-data.json');
  }

  public static getInstance(): MemoryDatabase {
    if (!MemoryDatabase.instance) {
      MemoryDatabase.instance = new MemoryDatabase();
    }
    return MemoryDatabase.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Criar diretório de dados se não existir
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        // Data directory created
      }

      // Carregar dados do arquivo se existir
      if (fs.existsSync(this.dataPath)) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        const data = JSON.parse(fileContent);
        this.tasks = data.tasks || [];
        this.notes = data.notes || [];
        this.nextTaskId = data.nextTaskId || this.tasks.length + 1;
        this.nextNoteId = data.nextNoteId || this.notes.length + 1;
        // Data loaded from file
      } else {
        // Inserir dados de exemplo
        await this.insertSampleData();
        // Sample data created
      }

      this.isInitialized = true;
      // Memory Database initialized successfully
    } catch (error) {
      console.error('❌ Memory Database initialization failed:', error);
      // Em caso de erro, continuar com dados vazios
      this.tasks = [];
      this.notes = [];
      this.nextTaskId = 1;
      this.nextNoteId = 1;
      this.isInitialized = true;
    }
  }

  private async insertSampleData(): Promise<void> {
    const sampleTasks = [
      { title: '🎯 Configurar projeto', status: 'concluido' as const, priority: 1 },
      { title: '🎨 Implementar UI base', status: 'concluido' as const, priority: 2 },
      { title: '💾 Integrar banco de dados', status: 'hoje' as const, priority: 1 },
      { title: '📝 Criar sistema de tarefas', status: 'esta_semana' as const, priority: 2 },
      { title: '⏱️ Implementar timer Pomodoro', status: 'backlog' as const, priority: 3 },
      { title: '📊 Adicionar relatórios', status: 'backlog' as const, priority: 4 }
    ];

    for (const taskData of sampleTasks) {
      await this.createTask(taskData);
    }

    // Criar algumas notas de exemplo
    const sampleNotes = [
      { 
        title: '📋 Guia de Instalação', 
        content: '# Guia de Instalação\n\n1. Clone o repositório\n2. Instale as dependências com `npm install`\n3. Execute com `npm start`',
        format: 'markdown' as const,
        tags: ['documentação', 'setup'],
        linkedTaskIds: [1, 2] // Vincular às primeiras tarefas
      },
      { 
        title: '💡 Ideias para Features', 
        content: '- Sincronização na nuvem\n- Modo offline\n- Integração com calendário\n- Exportar para PDF',
        format: 'text' as const,
        tags: ['ideias', 'roadmap'],
        linkedTaskIds: [3] // Vincular à terceira tarefa
      }
    ];

    for (const noteData of sampleNotes) {
      await this.createNote(noteData);
    }
  }

  private saveToFile(): void {
    try {
      const data = {
        tasks: this.tasks,
        notes: this.notes,
        nextTaskId: this.nextTaskId,
        nextNoteId: this.nextNoteId,
        lastSaved: new Date().toISOString(),
        version: '1.0.0'
      };
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('⚠️ Failed to save to file:', error);
    }
  }

  public async getAllTasks(): Promise<Task[]> {
    return [...this.tasks].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public async getTasksByStatus(status: string): Promise<Task[]> {
    return this.tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.priority - b.priority);
  }

  public async createTask(taskData: CreateTaskData): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: this.nextTaskId++,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'backlog',
      priority: taskData.priority || 3,
      category_id: taskData.category_id,
      created_at: now,
      updated_at: now,
      linkedNoteId: taskData.linkedNoteId
    };

    this.tasks.push(newTask);
    this.saveToFile();
    
    return newTask;
  }

  public async updateTask(id: number, updates: Partial<CreateTaskData>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...updates,
      updated_at: now
    };

    // Se mudou para concluído, adicionar completed_at
    if (updates.status === 'concluido' && this.tasks[taskIndex].status !== 'concluido') {
      updatedTask.completed_at = now;
    }

    this.tasks[taskIndex] = updatedTask;
    this.saveToFile();
    
    return updatedTask;
  }

  public async deleteTask(id: number): Promise<boolean> {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    
    if (this.tasks.length < initialLength) {
      this.saveToFile();
      return true;
    }
    
    return false;
  }

  public async getTaskStats(): Promise<{
    total: number;
    backlog: number;
    esta_semana: number;
    hoje: number;
    concluido: number;
  }> {
    const stats = {
      total: this.tasks.length,
      backlog: 0,
      esta_semana: 0,
      hoje: 0,
      concluido: 0
    };

    this.tasks.forEach(task => {
      switch (task.status) {
        case 'backlog':
          stats.backlog++;
          break;
        case 'esta_semana':
          stats.esta_semana++;
          break;
        case 'hoje':
          stats.hoje++;
          break;
        case 'concluido':
          stats.concluido++;
          break;
      }
    });

    return stats;
  }

  // Métodos para Notas
  public async getAllNotes(): Promise<Note[]> {
    return [...this.notes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public async getNoteById(id: number): Promise<Note | null> {
    return this.notes.find(note => note.id === id) || null;
  }

  public async createNote(noteData: CreateNoteData): Promise<Note> {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: this.nextNoteId++,
      title: noteData.title,
      content: noteData.content || '',
      format: noteData.format || 'text',
      tags: noteData.tags || [],
      linkedTaskIds: noteData.linkedTaskIds || [], // Mudança: array
      attachments: [],
      attachedImages: noteData.attachedImages || [], // Incluir imagens anexadas
      created_at: now,
      updated_at: now,
      workspace_id: 1,
      is_pinned: false,
      is_archived: false,
      color: noteData.color
    };

    this.notes.push(newNote);
    this.saveToFile();
    
    return newNote;
  }

  public async updateNote(id: number, updates: UpdateNoteData): Promise<Note> {
    const noteIndex = this.notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const now = new Date().toISOString();
    const updatedNote: Note = {
      ...this.notes[noteIndex],
      ...updates,
      updated_at: now
    };

    this.notes[noteIndex] = updatedNote;
    this.saveToFile();
    
    return updatedNote;
  }

  public async deleteNote(id: number): Promise<boolean> {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== id);
    
    if (this.notes.length < initialLength) {
      // Remove link from any tasks
      this.tasks.forEach(task => {
        if (task.linkedNoteId === id) {
          task.linkedNoteId = undefined;
        }
      });
      this.saveToFile();
      return true;
    }
    
    return false;
  }

  public async getNoteStats(): Promise<NoteStats> {
    const stats: NoteStats = {
      total: this.notes.length,
      pinned: this.notes.filter(n => n.is_pinned).length,
      archived: this.notes.filter(n => n.is_archived).length,
      withAttachments: this.notes.filter(n => n.attachments && n.attachments.length > 0).length,
      linkedToTasks: this.notes.filter(n => n.linkedTaskIds && n.linkedTaskIds.length > 0).length
    };

    return stats;
  }

  public async linkTaskToNote(taskId: number, noteId: number): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    const note = this.notes.find(n => n.id === noteId);

    if (!task || !note) {
      throw new Error('Task or Note not found');
    }

    // Remover tarefa de nota anterior se existir
    if (task.linkedNoteId) {
      const oldNote = this.notes.find(n => n.id === task.linkedNoteId);
      if (oldNote && oldNote.linkedTaskIds) {
        oldNote.linkedTaskIds = oldNote.linkedTaskIds.filter(id => id !== taskId);
      }
    }

    // Adicionar tarefa à nova nota
    task.linkedNoteId = noteId;
    if (!note.linkedTaskIds) {
      note.linkedTaskIds = [];
    }
    if (!note.linkedTaskIds.includes(taskId)) {
      note.linkedTaskIds.push(taskId);
    }

    this.saveToFile();
  }

  public async unlinkTaskFromNote(taskId: number): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.linkedNoteId) return;

    const note = this.notes.find(n => n.id === task.linkedNoteId);
    if (note && note.linkedTaskIds) {
      note.linkedTaskIds = note.linkedTaskIds.filter(id => id !== taskId);
    }
    
    task.linkedNoteId = undefined;
    this.saveToFile();
  }

  // Métodos legados mantidos para compatibilidade
  public async linkNoteToTask(noteId: number, taskId: number): Promise<void> {
    return this.linkTaskToNote(taskId, noteId);
  }

  public async unlinkNoteFromTask(noteId: number): Promise<void> {
    // Remove todas as tarefas vinculadas a esta nota
    const note = this.notes.find(n => n.id === noteId);
    if (!note || !note.linkedTaskIds) return;

    note.linkedTaskIds.forEach(taskId => {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.linkedNoteId = undefined;
      }
    });
    
    note.linkedTaskIds = [];
    this.saveToFile();
  }

  public async close(): Promise<void> {
    // Salvar dados antes de fechar
    this.saveToFile();
    // Memory database saved and closed
  }

  public async clearAll(): Promise<void> {
    this.tasks = [];
    this.notes = [];
    this.nextTaskId = 1;
    this.nextNoteId = 1;
    this.saveToFile();
    // All data cleared from memory database
  }

  public async exportData(): Promise<string> {
    const exportData = {
      tasks: this.tasks,
      notes: this.notes,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  public async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        this.tasks = data.tasks;
        this.nextTaskId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
        
        if (data.notes && Array.isArray(data.notes)) {
          this.notes = data.notes;
          this.nextNoteId = Math.max(...this.notes.map(n => n.id), 0) + 1;
        }
        
        this.saveToFile();
        // Data imported successfully
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      throw error;
    }
  }
}

export default MemoryDatabase; 