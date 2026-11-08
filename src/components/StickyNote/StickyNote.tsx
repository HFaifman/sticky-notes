import type { PointerEvent as ReactPointerEvent } from 'react';
import { NOTE_COLORS } from '../../constants';
import type { DragKind, Note, NoteColor } from '../../types';
import './StickyNote.css';

type StickyNoteProps = {
  note: Note;
  isDragging: boolean;
  onStartDrag: (event: ReactPointerEvent<HTMLElement>, note: Note, kind: DragKind) => void;
  onMoveDrag: (event: ReactPointerEvent<HTMLElement>) => void;
  onEndDrag: (event: ReactPointerEvent<HTMLElement>) => void;
  onBringToFront: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
  onDelete: (id: string) => void;
};

function StickyNote({
  note,
  isDragging,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onBringToFront,
  onTextChange,
  onColorChange,
  onDelete,
}: StickyNoteProps) {
  return (
    <article
      className={`note note-${note.color} ${isDragging ? 'is-dragging' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
      }}
      onPointerMove={onMoveDrag}
      onPointerUp={onEndDrag}
      onPointerCancel={onEndDrag}
      onClick={() => onBringToFront(note.id)}
    >
      <div className="note-header" onPointerDown={(event) => onStartDrag(event, note, 'move')}>
        <span className="drag-grip" aria-hidden="true">
          ⠿
        </span>
        <span className="note-caption">NOTE</span>
        <div className="note-actions">
          <select
            aria-label="Change note color"
            value={note.color}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => onColorChange(note.id, event.target.value as NoteColor)}
          >
            {NOTE_COLORS.map((color) => (
              <option key={color} value={color}>
                {color[0].toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
          <button
            className="delete-button"
            aria-label="Delete note"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onDelete(note.id)}
          >
            ×
          </button>
        </div>
      </div>

      <textarea
        className="note-editor"
        aria-label="Note text"
        placeholder="Write something..."
        value={note.text}
        onChange={(event) => onTextChange(note.id, event.target.value)}
        onPointerDown={() => onBringToFront(note.id)}
        spellCheck
      />
      <div
        className="resize-handle"
        role="button"
        aria-label="Resize note"
        onPointerDown={(event) => onStartDrag(event, note, 'resize')}
      >
        <span />
      </div>
    </article>
  );
}

export default StickyNote;
