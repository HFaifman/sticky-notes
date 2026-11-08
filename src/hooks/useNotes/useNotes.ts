import { useEffect, useState } from 'react';
import { loadNotes, saveNotes } from '../../api/notes';
import type { Note } from '../../types';

/** Loads and persists notes, keeping API concerns out of the application component. */
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    void loadNotes().then((loadedNotes) => {
      if (!isActive) return;
      setNotes(loadedNotes);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void saveNotes(notes);
    }
  }, [isLoading, notes]);

  return { notes, setNotes, isLoading };
}
