import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useDatabase } from '../hooks/useDatabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  ArrowLeft, Save, Trash2, Pin, Tag, Link2, 
  Image, Paperclip, Bold, Italic, List, 
  Hash, Quote, Code, Eye, Edit, Copy,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Note, CreateNoteData } from '../../shared/types/note';

interface NoteEditorProps {
  note?: Note | null;
  onSave?: (noteData: CreateNoteData) => void;
  onDelete?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSave, 
  onDelete, 
  onBack,
  onClose 
}) => {
  const { theme } = useTheme();
  const { tasks } = useDatabase();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [linkedTaskIds, setLinkedTaskIds] = useState<number[]>(note?.linkedTaskIds || []);
  const [color, setColor] = useState(note?.color || '');
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false);
  const [format, setFormat] = useState<'markdown' | 'text'>(note?.format || 'text');
  const [previewMode, setPreviewMode] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isLinkedTasksExpanded, setIsLinkedTasksExpanded] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSave = () => {
    console.log('📝 NoteEditor: handleSave called');
    console.log('📝 Title:', title);
    console.log('📝 Content length:', content.length);
    console.log('📝 LinkedTaskIds:', linkedTaskIds);
    
    if (!title.trim()) {
      console.log('❌ NoteEditor: Title is empty, not saving');
      return;
    }
    
    const noteData: CreateNoteData = {
      title: title.trim(),
      content,
      format,
      tags,
      linkedTaskIds,
      color: color || undefined
    };

    console.log('📝 NoteEditor: Saving note data:', noteData);
    console.log('📝 NoteEditor: onSave available:', !!onSave);
    console.log('📝 NoteEditor: onClose available:', !!onClose);

    if (onSave) {
      console.log('📝 NoteEditor: Calling onSave');
      onSave(noteData);
    } else if (onClose) {
      console.log('📝 NoteEditor: Calling onClose');
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // TODO: Implementar upload de imagem
          const imageText = `![Imagem colada](data:image/png;base64,...)`;
          insertMarkdown(imageText);
        }
      }
    }
  };

  const renderPreview = () => {
    if (format === 'text') {
      return (
        <div style={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          color: isDark ? 'var(--color-text-primary)' : '#1F2937'
        }}>
          {content}
        </div>
      );
    }

    // Renderização simples de markdown
    let html = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>');

    return (
      <div 
        style={{
          lineHeight: 1.6,
          color: isDark ? 'var(--color-text-primary)' : '#1F2937'
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const noteColors = [
    { name: 'teal', hex: '#00D4AA' },
    { name: 'purple', hex: '#7B3FF2' },
    { name: 'blue', hex: '#3B82F6' },
    { name: 'yellow', hex: '#F59E0B' },
    { name: 'red', hex: '#EF4444' },
    { name: 'green', hex: '#10B981' },
    { name: 'violet', hex: '#8B5CF6' },
    { name: 'orange', hex: '#F97316' }
  ];

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? 'var(--color-bg-primary)' : '#FAFAFA'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
        backgroundColor: isDark ? 'var(--color-bg-secondary)' : '#FFFFFF'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onBack || onClose}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? 'var(--color-text-secondary)' : '#6B7280',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{
              fontSize: 20,
              fontWeight: 600,
              color: isDark ? 'var(--color-text-primary)' : '#1F2937',
              margin: 0
            }}>
              {note ? 'Editar Nota' : 'Nova Nota'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                style={{ color: 'var(--color-error)' }}
              >
                <Trash2 size={16} />
              </Button>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              <Save size={16} />
              Salvar
            </Button>
          </div>
        </div>

        {/* Título */}
        <Input
          type="text"
          placeholder="Título da nota..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ 
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 16
          }}
        />

        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Botões de formato */}
          {format === 'markdown' && !previewMode && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => insertMarkdown('**', '**')}
                style={{
                  background: 'none',
                  border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                  color: isDark ? 'var(--color-text-primary)' : '#374151',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4
                }}
                title="Negrito"
              >
                <Bold size={14} />
              </button>
              <button
                onClick={() => insertMarkdown('*', '*')}
                style={{
                  background: 'none',
                  border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                  color: isDark ? 'var(--color-text-primary)' : '#374151',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4
                }}
                title="Itálico"
              >
                <Italic size={14} />
              </button>
              <button
                onClick={() => insertMarkdown('# ')}
                style={{
                  background: 'none',
                  border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                  color: isDark ? 'var(--color-text-primary)' : '#374151',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4
                }}
                title="Título"
              >
                <Hash size={14} />
              </button>
              <button
                onClick={() => insertMarkdown('- ')}
                style={{
                  background: 'none',
                  border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                  color: isDark ? 'var(--color-text-primary)' : '#374151',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 4
                }}
                title="Lista"
              >
                <List size={14} />
              </button>
            </div>
          )}

          {/* Seletor de formato */}
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'markdown' | 'text')}
            style={{
              background: isDark ? 'var(--color-bg-tertiary)' : '#F9FAFB',
              border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
              color: isDark ? 'var(--color-text-primary)' : '#374151',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="text">Texto</option>
            <option value="markdown">Markdown</option>
          </select>

          {/* Preview toggle */}
          {format === 'markdown' && (
            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={{
                background: previewMode ? 'var(--color-primary-teal)' : 'none',
                border: `1px solid ${previewMode ? 'var(--color-primary-teal)' : (isDark ? 'var(--color-border-primary)' : '#E5E7EB')}`,
                color: previewMode ? '#FFFFFF' : (isDark ? 'var(--color-text-primary)' : '#374151'),
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {previewMode ? <Edit size={14} /> : <Eye size={14} />}
              {previewMode ? 'Editar' : 'Preview'}
            </button>
          )}

          {/* Copy button */}
          {previewMode && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                // TODO: Add toast notification
              }}
              style={{
                background: 'none',
                border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                color: isDark ? 'var(--color-text-primary)' : '#374151',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Copiar conteúdo"
            >
              <Copy size={14} />
              Copiar
            </button>
          )}

          {/* Cores */}
          <div style={{ display: 'flex', gap: 4 }}>
            {noteColors.map(noteColor => (
              <button
                key={noteColor.name}
                onClick={() => setColor(color === noteColor.name ? '' : noteColor.name)}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: noteColor.hex,
                  border: color === noteColor.name ? '2px solid #FFFFFF' : 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: color === noteColor.name ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ 
          flex: 1, 
          padding: 24,
          overflow: 'auto'
        }}>
          {previewMode ? (
            <div style={{
              minHeight: '100%',
              padding: 16,
              backgroundColor: isDark ? 'var(--color-bg-secondary)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
              borderRadius: 8
            }}>
              {renderPreview()}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="Escreva sua nota aqui..."
              style={{
                width: '100%',
                minHeight: '100%',
                padding: 16,
                backgroundColor: isDark ? 'var(--color-bg-secondary)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                borderRadius: 8,
                color: isDark ? 'var(--color-text-primary)' : '#1F2937',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                fontFamily: format === 'markdown' ? 'monospace' : 'inherit'
              }}
            />
          )}
        </div>

        {/* Sidebar com tags e vínculos */}
        <div style={{
          padding: 24,
          borderTop: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
          backgroundColor: isDark ? 'var(--color-bg-secondary)' : '#FFFFFF'
        }}>
          {/* Tags */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? 'var(--color-text-primary)' : '#1F2937',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} />
                Tags {tags.length > 0 && <span style={{ fontSize: 12, opacity: 0.7 }}>({tags.length})</span>}
              </div>
              {isTagsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isTagsExpanded && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 12,
                        padding: '4px 8px',
                        backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                        color: isDark ? 'var(--color-text-secondary)' : '#6B7280',
                        borderRadius: 12,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    type="text"
                    placeholder="Nova tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    style={{ flex: 1, fontSize: 12 }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    +
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Vínculo com tarefa */}
          <div>
            <button
              onClick={() => setIsLinkedTasksExpanded(!isLinkedTasksExpanded)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 14,
                fontWeight: 600,
                color: isDark ? 'var(--color-text-primary)' : '#1F2937',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link2 size={14} />
                Vincular Tarefa {linkedTaskIds.length > 0 && <span style={{ fontSize: 12, opacity: 0.7 }}>({linkedTaskIds.length})</span>}
              </div>
              {isLinkedTasksExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isLinkedTasksExpanded && (
              <div>
                <p style={{
                  fontSize: 12,
                  color: isDark ? 'var(--color-text-secondary)' : '#6B7280',
                  margin: '0 0 8px 0'
                }}>
                  {linkedTaskIds.length === 0 
                    ? 'Nenhuma tarefa vinculada' 
                    : `${linkedTaskIds.length} tarefa(s) vinculada(s)`
                  }
                </p>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const taskId = Number(e.target.value);
                      if (!linkedTaskIds.includes(taskId)) {
                        setLinkedTaskIds([...linkedTaskIds, taskId]);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    background: isDark ? 'var(--color-bg-tertiary)' : '#F9FAFB',
                    border: `1px solid ${isDark ? 'var(--color-border-primary)' : '#E5E7EB'}`,
                    color: isDark ? 'var(--color-text-primary)' : '#374151',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="">Adicionar tarefa...</option>
                  {tasks.filter(task => !linkedTaskIds.includes(task.id)).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                
                {linkedTaskIds.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {linkedTaskIds.map(taskId => {
                      const task = tasks.find(t => t.id === taskId);
                      return task ? (
                        <div key={taskId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                          borderRadius: 4,
                          fontSize: 12
                        }}>
                          <span>{task.title}</span>
                          <button
                            onClick={() => setLinkedTaskIds(linkedTaskIds.filter(id => id !== taskId))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isDark ? 'var(--color-text-muted)' : '#9CA3AF',
                              cursor: 'pointer',
                              fontSize: 14
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 