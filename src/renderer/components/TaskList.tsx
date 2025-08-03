import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../shared/types/task';
import { ChevronLeft, CalendarDays, File, Pencil, Trash, BookOpen } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import useNotes from '../hooks/useNotes';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleStatus: (taskId: number, newStatus: TaskStatus) => void;
  onBack?: () => void;
  title: string;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onBack,
  title,
  emptyMessage = "Nenhuma tarefa encontrada"
}) => {
  const { categories } = useCategories(tasks);
  const { notes } = useNotes();
  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#A0A0A0';
    }
  };

  const getPriorityLabel = (priority?: TaskPriority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return '';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getLinkedNoteTitle = (linkedNoteId?: number) => {
    if (!linkedNoteId) return null;
    const linkedNote = notes.find(note => note.id === linkedNoteId);
    return linkedNote ? linkedNote.title : `Nota #${linkedNoteId}`;
  };

  const getStatusOptions = (currentStatus: TaskStatus) => {
    // Primeiro, adicionar categorias do sistema
    const systemOptions = [
      { value: 'backlog' as TaskStatus, label: 'Backlog' },
      { value: 'esta_semana' as TaskStatus, label: 'Esta Semana' },
      { value: 'hoje' as TaskStatus, label: 'Hoje' },
      { value: 'concluido' as TaskStatus, label: 'Concluído' },
    ];

    // Depois, adicionar categorias customizadas
    const customOptions = categories
      .filter(cat => !cat.isSystem)
      .map(cat => ({
        value: cat.name.toLowerCase().replace(/\s+/g, '_') as TaskStatus,
        label: cat.name
      }));

    const allOptions = [...systemOptions, ...customOptions];
    return allOptions.filter(option => option.value !== currentStatus);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      minHeight: '100vh',
      padding: '24px',
      transition: 'all var(--transition-theme)',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-teal)';
                e.currentTarget.style.color = 'var(--color-primary-teal)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Voltar ao Dashboard"
            >
              <ChevronLeft size={20} strokeWidth={1.7} />
            </button>
          )}
          
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #00D4AA 0%, #7B3FF2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {title}
            </h1>
          </div>
          
          <div style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <File size={16} strokeWidth={1.7} />
            {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>
              <File size={48} strokeWidth={1.7} color="var(--color-text-muted)" />
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: 500,
            }}>
              {emptyMessage}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '16px',
              opacity: 0.7,
            }}>
              Suas tarefas aparecerão aqui quando forem criadas.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {tasks.map((task) => (
              <div key={task.id} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s ease',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: task.status === 'concluido' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      textDecoration: task.status === 'concluido' ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                      }}>
                        {task.description}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignItems: 'center',
                    }}>
                      {task.priority && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getPriorityColor(task.priority),
                          }} />
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <CalendarDays size={12} strokeWidth={1.7} />
                          {formatDate(task.due_date)}
                        </div>
                      )}
                      
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                      }}>
                        Criado em {formatDate(task.created_at)}
                      </div>
                      
                      {task.linkedNoteId && (
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--color-primary-teal)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                        title={`Clique para ver a nota: ${getLinkedNoteTitle(task.linkedNoteId)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar navegação para a nota
                          console.log('Navegando para nota:', task.linkedNoteId);
                        }}>
                          <BookOpen size={12} strokeWidth={1.7} />
                          {getLinkedNoteTitle(task.linkedNoteId)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginLeft: '16px',
                  }}>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          onToggleStatus(task.id, e.target.value as TaskStatus);
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#2A2A2A',
                        border: '1px solid #3A3A3A',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Mover para...</option>
                      {getStatusOptions(task.status).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onEdit(task)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #3A3A3A',
                        borderRadius: '6px',
                        color: '#00D4AA',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#00D4AA';
                        e.currentTarget.style.color = '#0A0A0A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#00D4AA';
                      }}
                    >
                      <Pencil size={14} strokeWidth={1.7} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir "${task.title}"?`)) {
                          onDelete(task.id);
                        }
                      }}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #3A3A3A',
                        borderRadius: '6px',
                        color: '#FF4444',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF4444';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#FF4444';
                      }}
                    >
                      <Trash size={14} strokeWidth={1.7} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 