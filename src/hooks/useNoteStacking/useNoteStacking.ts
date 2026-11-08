import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Note } from '../../types';

/** Tracks the highest z-index so notes can be raised or created above all others. */
export function useNoteStacking(notes: Note[], setNotes: Dispatch<SetStateAction<Note[]>>) {
  const maxZ = useRef(0);

  useEffect(() => {
    maxZ.current = notes.reduce((highest, note) => Math.max(highest, note.zIndex), 0);
  }, [notes]);

  const nextZIndex = useCallback(() => ++maxZ.current, []);

  const bringToFront = useCallback(
    (id: string) => {
      const nextZ = nextZIndex();
      setNotes((current) =>
        current.map((note) => (note.id === id ? { ...note, zIndex: nextZ } : note)),
      );
    },
    [nextZIndex, setNotes],
  );

  return { bringToFront, nextZIndex };
}
