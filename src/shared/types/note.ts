export interface Note {
  id: number;
  title: string;
  content: string;
  format: 'markdown' | 'text';
  tags?: string[];
  linkedTaskIds?: number[]; // Mudança: array de IDs de tarefas
  attachments?: NoteAttachment[];
  attachedImages?: string[]; // Array de imagens em base64
  created_at: string;
  updated_at: string;
  workspace_id?: number;
  is_pinned?: boolean;
  is_archived?: boolean;
  color?: string;
}

export interface NoteAttachment {
  id: string;
  noteId: number;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  created_at: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  format?: 'markdown' | 'text';
  tags?: string[];
  linkedTaskIds?: number[]; // Mudança: array de IDs de tarefas
  color?: string;
  attachedImages?: string[]; // Array de imagens em base64
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  is_pinned?: boolean;
  is_archived?: boolean;
}

export interface NoteStats {
  total: number;
  pinned: number;
  archived: number;
  withAttachments: number;
  linkedToTasks: number;
}

export interface NoteViewMode {
  mode: 'cards' | 'list';
}

export interface NoteFilter {
  search?: string;
  tags?: string[];
  hasAttachments?: boolean;
  isLinked?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
} 