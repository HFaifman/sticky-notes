import { useCallback, useState } from 'react';
import { AppFooter, AppHeader, Board, Toolbar } from './components';
import { useNoteDraft, useNotes, useNoteStacking } from './hooks';
import type { Note } from './types';
import './App.css';

function App() {
  const { notes, setNotes, isLoading } = useNotes();
  const draft = useNoteDraft();
  const { bringToFront, nextZIndex } = useNoteStacking(notes, setNotes);
  const [placementMode, setPlacementMode] = useState(false);

  const createNote = useCallback(
    (x: number, y: number) => {
      if (draft.isSizeInvalid) return;

      const width = Number(draft.width);
      const height = Number(draft.height);
      const note: Note = {
        id: crypto.randomUUID(),
        x: Math.max(0, x - width / 2),
        y: Math.max(0, y - height / 2),
        width,
        height,
        text: '',
        color: draft.color,
        zIndex: nextZIndex(),
      };

      setNotes((current) => [...current, note]);
      setPlacementMode(false);
    },
    [draft.isSizeInvalid, draft.width, draft.height, draft.color, nextZIndex, setNotes],
  );

  return (
    <main className="app-shell">
      <AppHeader noteCount={notes.length} />

      <section className="workspace">
        <Toolbar
          draft={draft}
          placementMode={placementMode}
          isLoading={isLoading}
          onPlacementModeChange={setPlacementMode}
        />

        <Board
          notes={notes}
          setNotes={setNotes}
          placementMode={placementMode}
          onCreateNote={createNote}
          onBringToFront={bringToFront}
          isLoading={isLoading}
        />
      </section>

      <AppFooter />
    </main>
  );
}

export default App;
