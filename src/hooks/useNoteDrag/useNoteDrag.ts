import { useCallback, useRef, useState } from 'react';
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SetStateAction,
} from 'react';
import type { DragKind, Note } from '../../types';

type DragState = {
  id: string;
  kind: DragKind;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
};

type UseNoteDragOptions = {
  setNotes: Dispatch<SetStateAction<Note[]>>;
  boardRef: RefObject<HTMLElement>;
  trashRef: RefObject<HTMLDivElement>;
  bringToFront: (id: string) => void;
};

function isInside(element: Element | null, x: number, y: number): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/** Owns pointer-based note movement, resizing, and drag-to-trash behavior. */
export function useNoteDrag({
  setNotes,
  boardRef,
  trashRef,
  bringToFront,
}: UseNoteDragOptions) {
  const dragRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overTrash, setOverTrash] = useState(false);

  const startDrag = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      note: Note,
      kind: DragKind,
    ) => {
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      bringToFront(note.id);

      dragRef.current = {
        id: note.id,
        kind,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: note.x,
        originY: note.y,
        originWidth: note.width,
        originHeight: note.height,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
      setDraggingId(note.id);
    },
    [bringToFront],
  );

  const moveDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const board = boardRef.current;
      if (!board) return;

      // Bound notes to the visible board instead of allowing them to expand its
      // scrollable area when dragged or resized past the right/bottom edges.
      const boardRect = board.getBoundingClientRect();
      const boardWidth = board.clientWidth || boardRect.width;
      const boardHeight = board.clientHeight || boardRect.height;

      if (drag.kind === 'move') {
        setNotes((current) =>
          current.map((note) => {
            if (note.id !== drag.id) return note;

            // A note restored from storage may be larger than the current
            // board, so constrain its dimensions before calculating position.
            const width = Math.min(note.width, boardWidth);
            const height = Math.min(note.height, boardHeight);
            const maxX = Math.max(0, boardWidth - width);
            const maxY = Math.max(0, boardHeight - height);

            return {
              ...note,
              width,
              height,
              x: Math.min(maxX, Math.max(0, drag.originX + dx)),
              y: Math.min(maxY, Math.max(0, drag.originY + dy)),
            };
          }),
        );
        setOverTrash(isInside(trashRef.current, event.clientX, event.clientY));
        return;
      }

      setNotes((current) =>
        current.map((note) => {
          if (note.id !== drag.id) return note;

          // Keep the minimum note size while moving the resize anchor inward
          // when necessary. This prevents min-width/min-height from defeating
          // the available-space calculation at any board edge or corner.
          const minWidth = Math.min(160, boardWidth);
          const minHeight = Math.min(130, boardHeight);
          const x = Math.min(
            Math.max(0, boardWidth - minWidth),
            Math.max(0, drag.originX),
          );
          const y = Math.min(
            Math.max(0, boardHeight - minHeight),
            Math.max(0, drag.originY),
          );
          const availableWidth = boardWidth - x;
          const availableHeight = boardHeight - y;

          return {
            ...note,
            x,
            y,
            width: Math.min(
              700,
              availableWidth,
              Math.max(minWidth, drag.originWidth + dx),
            ),
            height: Math.min(
              600,
              availableHeight,
              Math.max(minHeight, drag.originHeight + dy),
            ),
          };
        }),
      );
    },
    [boardRef, setNotes, trashRef],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (
        drag.kind === 'move' &&
        isInside(trashRef.current, event.clientX, event.clientY)
      ) {
        setNotes((current) => current.filter((note) => note.id !== drag.id));
      }

      dragRef.current = null;
      setDraggingId(null);
      setOverTrash(false);
    },
    [setNotes, trashRef],
  );

  return { draggingId, overTrash, startDrag, moveDrag, endDrag };
}
