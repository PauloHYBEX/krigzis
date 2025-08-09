import React from 'react';
import { Button } from './ui/Button';
import { X, Trash2, Link2 } from 'lucide-react';

interface ConfirmDeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  linkedTaskTitles?: string[];
}

export const ConfirmDeleteNoteModal: React.FC<ConfirmDeleteNoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  linkedTaskTitles = []
}) => {
  if (!isOpen) return null;

  const hasLinks = linkedTaskTitles.length > 0;

  return (
    <div className="confirm-delete-modal-backdrop" onClick={onClose}>
      <div className="confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-delete-header">
          <div className="confirm-delete-title-group">
            <Trash2 size={18} className="confirm-delete-icon" />
            <h2 className="confirm-delete-title">Excluir nota</h2>
          </div>
          <button className="confirm-delete-close" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="confirm-delete-content">
          <p className="confirm-delete-message">
            Tem certeza que deseja excluir a nota <strong>{noteTitle}</strong>?
          </p>

          {hasLinks && (
            <div className="confirm-delete-links">
              <div className="links-title">
                <Link2 size={14} />
                Tarefas vinculadas ({linkedTaskTitles.length})
              </div>
              <ul className="links-list">
                {linkedTaskTitles.map((t, i) => (
                  <li key={i} className="links-item">{t}</li>
                ))}
              </ul>
              <p className="links-warning">
                A exclusão removerá o vínculo destas tarefas com a nota.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="confirm-delete-footer">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} leftIcon={<Trash2 size={16} />}>Excluir</Button>
        </div>
      </div>
    </div>
  );
};



