# Sticky Notes

A desktop-first sticky notes board built with React, TypeScript, and Vite.

## Features

- Create notes at a clicked board position with a configurable size and color. Widths above 500 pixels show an inline validation error and disable placement.
- Move notes by dragging their header.
- Resize notes by dragging the bottom-right handle.
- Delete notes with the delete control or by dragging them into the trash zone.
- Edit note text and bring notes to the foreground.
- Persist notes in local storage and restore them on reload.
- Use an asynchronous mock REST API for loading and saving notes, backed by local storage.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Mock API

The app simulates asynchronous `GET /api/notes` and `PUT /api/notes` requests in `src/api/notes`. A small artificial network delay makes the request lifecycle observable, while local storage acts as the mock backend so notes survive reloads. Save requests discard stale responses to prevent older updates from overwriting newer note state. The API functions can later be replaced with real `fetch` calls without changing the components.

## Tests

```bash
npm test
```

Run Vitest in watch mode with `npm run test:watch`.

## Source layout

```text
src/
  api/
    notes/              # Async mock GET/PUT API and local-storage adapter (+ tests)
  hooks/
    useNotes/           # Async loading and persistence lifecycle
    useNoteDrag/        # Pointer-driven move, resize, and drag-to-trash
    useNoteDraft/       # Creation form inputs and validation
    useNoteStacking/    # Z-index tracking and bring-to-front
  utils/
    validateDimension/  # Whole-number range check for note sizes
  components/
    AppHeader/          # Title bar and note count
    AppFooter/
    Toolbar/            # Creation panel (uses SizeFields and ColorPicker)
    SizeFields/         # Width/height inputs and errors (+ tests)
    ColorPicker/        # New-note color swatches
    Board/              # Board surface, placement clicks, drag wiring
    BoardEmptyState/    # Loading and empty-board messages
    StickyNote/         # A single note (+ tests)
    TrashZone/          # Drag-to-delete target
  types.ts              # Shared note domain types
  constants.ts          # Note colors and size limits
  App.tsx               # Workspace layout, placement mode, note creation
  App.css               # Page layout styles
  App.test.tsx          # Application interaction tests
  styles.css            # Global base styles and fonts
```

Each folder holds the module, its stylesheet and tests where present, and an `index.ts` that
re-exports it, so imports point at the folder (for example `./components/Board`).

The drag-to-delete target is positioned in the top-left corner inside the board canvas. Drag a note over it and release to delete the note.

`src/hooks/useNotes` owns asynchronous note loading and persistence, keeping data lifecycle concerns out of `App`.
