# Architecture

The application separates the top-level workspace, board interactions, persistence, and pointer
mechanics. `App.tsx` coordinates placement mode and note creation. The `useNotes` hook owns the note
collection and its loading and persistence lifecycle, the `useNoteDraft` hook holds the creation
form's inputs and validation, and the `useNoteStacking` hook tracks the highest z-index so notes
can be brought to front or created on top.

UI pieces live in `src/components`:

- `AppHeader` / `AppFooter` — static chrome; the header shows the note count.
- `Toolbar` — the creation panel, composed of `SizeFields` (width/height inputs and errors) and
  `ColorPicker` (swatches).
- `Board` — handles placement clicks and note-level editing actions, and wires `useNoteDrag` to
  its children: `BoardEmptyState` (loading and empty messages), `StickyNote` (a single note), and
  `TrashZone` (the drop-to-delete target).

Each component lives in its own folder with its stylesheet, tests, and an `index.ts` re-export
(`components/Toolbar/` holds `Toolbar.tsx`, `Toolbar.css`, and `index.ts`), while
`src/styles.css` holds only global base styles (fonts, `:root`, `body`) and `src/App.css` holds the
page layout.

Shared domain types live in `src/types.ts` and shared limits and the color list live in
`src/constants.ts`, keeping the note model consistent across the application.

Persistence is isolated behind an asynchronous mock API in `src/api/notes`. `loadNotes` and
`saveNotes` simulate `GET /api/notes` and `PUT /api/notes` with a small network delay, while local
storage acts as the mock backend. The storage key and validation remain private to this module, so
UI components do not need to know the storage format or access `localStorage` directly. Loading
validates persisted data and safely falls back to an empty board if the stored value is malformed or
storage is unavailable. Save requests use request sequencing to ignore stale responses and prevent
older state from overwriting newer changes. `useNotes` waits for the initial load before persisting state, while `App.tsx` disables note
placement until loading completes, avoiding an empty initial state overwriting saved notes.

Pointer interaction is encapsulated by the `useNoteDrag` hook in `src/hooks/useNoteDrag`. It owns the active
pointer session and exposes handlers for starting, updating, and ending a move or resize operation.
It also tracks whether a moved note is over the trash zone and removes the note on release. `Board`
wires these handlers to the relevant elements, keeping low-level pointer bookkeeping out of the
rendering code while `App` retains ownership of the note state.

Drag and resize interactions are constrained to the visible board dimensions. Notes are clamped at the right and bottom edges, preventing pointer interactions from expanding the board with unwanted scroll overflow. Resize limits are also calculated from the remaining space between a note and the board edges.

## Board boundaries

The board clips visual overflow instead of exposing scrollbars. The drag hook
constrains both note positions and dimensions against the board's current inner
width and height. During resizing, it also moves the resize anchor inward when
needed to preserve the minimum note dimensions without crossing an edge.

The drag-to-delete target is positioned in the top-left corner inside the board canvas. The drag hook checks the pointer against the target's current bounding rectangle, so the deletion behavior is independent of its visual placement.

The `useNotes` hook owns the note data lifecycle: it loads notes asynchronously on mount, exposes loading state and the note state setter, and persists updates through the mock API. `App` consumes this hook without coordinating API calls directly. The trash target is positioned absolutely inside the board, at its top-left corner, so its hit area is part of the note canvas rather than the browser viewport.

The note creation toolbar validates the requested width before placement. Widths greater than 500 pixels display an accessible inline error and disable the placement action; the creation logic also retains a defensive 500-pixel clamp.
