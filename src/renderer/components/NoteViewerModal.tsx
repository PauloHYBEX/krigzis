import React, { useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { X, Image as ImageIcon, FileText, FileCode2 } from 'lucide-react';
import { Note, NoteAttachment } from '../../shared/types/note';

interface NoteViewerModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
}

function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  let output = markdown;
  // Remove code blocks
  output = output.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  // Inline code
  output = output.replace(/`([^`]+)`/g, '$1');
  // Images ![alt](url)
  output = output.replace(/!\[[^\]]*\]\([^\)]*\)/g, '');
  // Links [text](url)
  output = output.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1');
  // Bold/italic/strikethrough
  output = output.replace(/\*\*([^*]+)\*\*/g, '$1');
  output = output.replace(/\*([^*]+)\*/g, '$1');
  output = output.replace(/__([^_]+)__/g, '$1');
  output = output.replace(/_([^_]+)_/g, '$1');
  output = output.replace(/~~([^~]+)~~/g, '$1');
  // Headings
  output = output.replace(/^#{1,6}\s*/gm, '');
  // Blockquotes
  output = output.replace(/^>\s?/gm, '');
  // Lists
  output = output.replace(/^\s*[-*+]\s+/gm, '');
  output = output.replace(/^\s*\d+\.\s+/gm, '');
  // Horizontal rules
  output = output.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '');
  // Excess spaces
  output = output.replace(/\s+$/gm, '');
  return output.trim();
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({ isOpen, note, onClose }) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const hasImages = useMemo(() => {
    if (!note) return false;
    const byArray = (note.attachedImages && note.attachedImages.length > 0);
    const byAttachments = (note.attachments || []).some(
      (a: NoteAttachment) => a.type === 'image' && Boolean(a.url)
    );
    return byArray || byAttachments;
  }, [note]);

  if (!isOpen || !note) return null;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(note.content || '');
    } catch (err) {
      console.error('Erro ao copiar markdown:', err);
    }
  };

  const handleCopyText = async () => {
    try {
      const text = note.format === 'markdown' ? stripMarkdown(note.content || '') : (note.content || '');
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  return (
    <div className="note-viewer-modal-backdrop" onClick={onClose}>
      <div className="note-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="note-viewer-header">
          <div className="note-viewer-title-group">
            <h2 className="note-viewer-title">{note.title}</h2>
            <span className="note-viewer-format-badge">{note.format === 'markdown' ? 'MD' : 'TXT'}</span>
          </div>
          <div className="note-viewer-actions">
            <Button variant="secondary" size="sm" onClick={handleCopyMarkdown} title="Copiar como Markdown">
              <FileCode2 size={16} />
              Copiar MD
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopyText} title="Copiar como Texto">
              <FileText size={16} />
              Copiar Texto
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="note-viewer-content">
          <div className="note-viewer-text">
            <pre className="note-viewer-pre">
{note.content}
            </pre>
          </div>

          {hasImages && (
            <div className="note-viewer-images">
              <div className="note-viewer-section-title">
                <ImageIcon size={16} />
                Anexos (clique para ampliar)
              </div>
              <div className="note-images-grid">
                {(note.attachedImages || []).map((src, idx) => (
                  <button
                    key={`img-array-${idx}`}
                    className="note-image-button"
                    onClick={() => setLightboxSrc(src)}
                    title="Ampliar imagem"
                  >
                    <img src={src} className="note-image" alt={`Anexo ${idx + 1}`} />
                  </button>
                ))}
                {(note.attachments || [])
                  .filter((a) => a.type === 'image' && a.url)
                  .map((a, idx) => (
                    <button
                      key={`img-attach-${idx}`}
                      className="note-image-button"
                      onClick={() => setLightboxSrc(a.url)}
                      title={a.name || 'Ampliar imagem'}
                    >
                      <img src={a.url} className="note-image" alt={a.name || `Anexo ${idx + 1}`} />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {lightboxSrc && (
          <div className="note-image-lightbox" onClick={() => setLightboxSrc(null)}>
            <button className="note-image-lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Fechar">
              <X size={18} />
            </button>
            <img src={lightboxSrc} className="note-image-lightbox-img" alt="Imagem ampliada" />
          </div>
        )}
      </div>
    </div>
  );
};


