import { useState, useEffect, useCallback } from 'react';
import { Note, CreateNoteData, UpdateNoteData, NoteStats } from '../../shared/types/note';

const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    // Fetching notes...
    setIsLoading(true);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      // Development logging removed for cleaner production build
      
      if (!electron) {
        console.warn('⚠️ useNotes: electronAPI not available, using fallback empty array');
        setNotes([]);
        return;
      }

      if (!electron.database || !electron.database.getAllNotes) {
        console.warn('⚠️ useNotes: database.getAllNotes not available, using fallback empty array');
        setNotes([]);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 useNotes: Calling getAllNotes...');
      }
      const allNotes = await electron.database.getAllNotes();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ useNotes: Received notes:', allNotes?.length || 0, 'items');
      }
      setNotes(allNotes || []);
    } catch (err) {
      console.error('❌ useNotes: Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      // Fallback para evitar loading infinito
      setNotes([]);
    } finally {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 useNotes: Setting isLoading to false');
      }
      setIsLoading(false);
    }
  }, []);

  // Create a new note
  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    console.log('🔍 useNotes: Starting createNote...', noteData);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.createNote) {
        console.warn('⚠️ useNotes: createNote not available');
        setError('Create note functionality not available');
        return null;
      }

      const newNote = await electron.database.createNote(noteData);
      console.log('✅ useNotes: Note created:', newNote);
      if (newNote) {
        setNotes(prev => [newNote, ...prev]);
      }
      return newNote || null;
    } catch (err) {
      console.error('❌ useNotes: Error creating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create note');
      return null;
    }
  };

  // Update a note
  const updateNote = async (id: number, updates: UpdateNoteData): Promise<Note | null> => {
    console.log('🔍 useNotes: Starting updateNote...', id, updates);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.updateNote) {
        console.warn('⚠️ useNotes: updateNote not available');
        setError('Update note functionality not available');
        return null;
      }

      const updatedNote = await electron.database.updateNote(id, updates);
      console.log('✅ useNotes: Note updated:', updatedNote);
      if (updatedNote) {
        setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      }
      return updatedNote || null;
    } catch (err) {
      console.error('❌ useNotes: Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
      return null;
    }
  };

  // Delete a note
  const deleteNote = async (id: number): Promise<boolean> => {
    console.log('🔍 useNotes: Starting deleteNote...', id);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.deleteNote) {
        console.warn('⚠️ useNotes: deleteNote not available');
        setError('Delete note functionality not available');
        return false;
      }

      const success = await electron.database.deleteNote(id);
      console.log('✅ useNotes: Note deleted:', success);
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id));
      }
      return success || false;
    } catch (err) {
      console.error('❌ useNotes: Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      return false;
    }
  };

  // Get note statistics
  const getNoteStats = async (): Promise<NoteStats | null> => {
    console.log('🔍 useNotes: Starting getNoteStats...');
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.getNoteStats) {
        console.warn('⚠️ useNotes: getNoteStats not available');
        return { total: notes.length, pinned: 0, archived: 0, withAttachments: 0, linkedToTasks: 0 };
      }

      const stats = await electron.database.getNoteStats();
      console.log('✅ useNotes: Note stats:', stats);
      return stats || null;
    } catch (err) {
      console.error('❌ useNotes: Error getting note stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to get note stats');
      return null;
    }
  };

  // Link task to note (novo método principal)
  const linkTaskToNote = async (taskId: number, noteId: number): Promise<boolean> => {
    console.log('🔍 useNotes: Starting linkTaskToNote...', taskId, noteId);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.linkTaskToNote) {
        console.warn('⚠️ useNotes: linkTaskToNote not available');
        setError('Link task to note functionality not available');
        return false;
      }

      await electron.database.linkTaskToNote(taskId, noteId);
      console.log('✅ useNotes: Task linked to note');
      
      // Atualizar local state para refletir o novo vínculo
      setNotes(prev => prev.map(note => {
        if (note.id === noteId) {
          const linkedTaskIds = note.linkedTaskIds || [];
          if (!linkedTaskIds.includes(taskId)) {
            return { ...note, linkedTaskIds: [...linkedTaskIds, taskId] };
          }
        }
        return note;
      }));
      return true;
    } catch (err) {
      console.error('❌ useNotes: Error linking task to note:', err);
      setError(err instanceof Error ? err.message : 'Failed to link task to note');
      return false;
    }
  };

  // Unlink task from note
  const unlinkTaskFromNote = async (taskId: number): Promise<boolean> => {
    console.log('🔍 useNotes: Starting unlinkTaskFromNote...', taskId);
    setError(null);
    try {
      const electron = (window as any).electronAPI;
      
      if (!electron?.database?.unlinkTaskFromNote) {
        console.warn('⚠️ useNotes: unlinkTaskFromNote not available');
        setError('Unlink task from note functionality not available');
        return false;
      }

      await electron.database.unlinkTaskFromNote(taskId);
      console.log('✅ useNotes: Task unlinked from note');
      
      // Atualizar local state para remover o vínculo
      setNotes(prev => prev.map(note => ({
        ...note,
        linkedTaskIds: note.linkedTaskIds?.filter(id => id !== taskId) || []
      })));
      return true;
    } catch (err) {
      console.error('❌ useNotes: Error unlinking task from note:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlink task from note');
      return false;
    }
  };

  // Legacy methods removed - use linkTaskToNote and unlinkTaskFromNote instead

  // Load notes on component mount - optimized
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 useNotes: useEffect triggered, calling fetchNotes');
    }
    fetchNotes();
  }, []); // Remove fetchNotes from dependencies to prevent infinite loops

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteStats,
    linkTaskToNote,
    unlinkTaskFromNote
  };
};

export default useNotes; 