import type { Note, NoteColor } from '../../types';

export const STORAGE_KEY = 'sticky-notes.v1';

const MOCK_API_LATENCY_MS = 150;
const COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple'];
let latestSaveRequest = 0;

function simulateNetworkLatency(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_API_LATENCY_MS);
  });
}

function readStoredNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is Note =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.x === 'number' &&
        Number.isFinite(item.x) &&
        typeof item.y === 'number' &&
        Number.isFinite(item.y) &&
        typeof item.width === 'number' &&
        Number.isFinite(item.width) &&
        typeof item.height === 'number' &&
        Number.isFinite(item.height) &&
        typeof item.text === 'string' &&
        COLORS.includes(item.color) &&
        typeof item.zIndex === 'number' &&
        Number.isFinite(item.zIndex),
    );
  } catch {
    // Invalid JSON or unavailable storage should not prevent the board from loading.
    return [];
  }
}

/** Simulates an asynchronous GET /api/notes request using local storage as the mock backend. */
export async function loadNotes(): Promise<Note[]> {
  // A fresh read invalidates writes that were still pending from an earlier app session.
  latestSaveRequest += 1;
  await simulateNetworkLatency();
  return readStoredNotes();
}

/** Simulates an asynchronous PUT /api/notes request using local storage as the mock backend. */
export async function saveNotes(notes: Note[]): Promise<void> {
  const requestId = ++latestSaveRequest;
  const serializedNotes = JSON.stringify(notes);

  await simulateNetworkLatency();

  // Ignore stale responses so a slower, older request cannot overwrite newer note state.
  if (requestId !== latestSaveRequest) return;

  try {
    localStorage.setItem(STORAGE_KEY, serializedNotes);
  } catch {
    // Storage can be unavailable (for example, in private browsing with a strict policy).
  }
}
