import { useCallback, useRef } from 'react';
import type { Dispatch, MouseEvent as ReactMouseEvent, SetStateAction } from 'react';
import { useNoteDrag } from '../../hooks';
import type { Note, NoteColor } from '../../types';
import BoardEmptyState from '../BoardEmptyState';
import StickyNote from '../StickyNote';
import TrashZone from '../TrashZone';
import './Board.css';

type BoardProps = {
  notes: Note[];
  setNotes: Dispatch<SetStateAction<Note[]>>;
  placementMode: boolean;
  onCreateNote: (x: number, y: number) => void;
  onBringToFront: (id: string) => void;
  isLoading: boolean;
};

function Board({
  notes,
  setNotes,
  placementMode,
  onCreateNote,
  onBringToFront,
  isLoading,
}: BoardProps) {
  const boardRef = useRef<HTMLElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);

  const { draggingId, overTrash, startDrag, moveDrag, endDrag } = useNoteDrag({
    setNotes,
    boardRef,
    trashRef,
    bringToFront: onBringToFront,
  });

  const handleBoardClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (
        isLoading ||
        !placementMode ||
        (event.target as HTMLElement).closest('.note, .toolbar, .trash-zone')
      ) {
        return;
      }

      const board = boardRef.current;
      if (!board) return;

      const rect = board.getBoundingClientRect();
      onCreateNote(
        event.clientX - rect.left + board.scrollLeft,
        event.clientY - rect.top + board.scrollTop,
      );
    },
    [isLoading, onCreateNote, placementMode],
  );

  const updateText = (id: string, text: string) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, text } : note)));
  };

  const changeColor = (id: string, color: NoteColor) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, color } : note)));
  };

  const deleteNote = (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  return (
    <section
      ref={boardRef}
      className={`board ${placementMode ? 'placement-mode' : ''}`}
      onClick={handleBoardClick}
      aria-label="Sticky notes board"
      aria-busy={isLoading}
    >
      <div className="board-label">
        <span>MY BOARD</span>
        <span className="board-subtitle">A little space for big ideas</span>
      </div>

      {(isLoading || notes.length === 0) && <BoardEmptyState isLoading={isLoading} />}

      {!isLoading &&
        notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            isDragging={draggingId === note.id}
            onStartDrag={startDrag}
            onMoveDrag={moveDrag}
            onEndDrag={endDrag}
            onBringToFront={onBringToFront}
            onTextChange={updateText}
            onColorChange={changeColor}
            onDelete={deleteNote}
          />
        ))}

      <TrashZone ref={trashRef} isDragging={draggingId !== null} isOver={overTrash} />
    </section>
  );
}

export default Board;
