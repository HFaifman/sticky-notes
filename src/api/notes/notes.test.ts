import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadNotes, saveNotes, STORAGE_KEY } from './notes';
import type { Note } from '../../types';

const olderNote: Note = {
  id: 'older-note',
  x: 10,
  y: 20,
  width: 200,
  height: 160,
  text: 'Older state',
  color: 'yellow',
  zIndex: 1,
};

const newerNote: Note = {
  ...olderNote,
  id: 'newer-note',
  text: 'Newer state',
  zIndex: 2,
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('mock notes API', () => {
  it('loads notes asynchronously', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([olderNote]));

    let requestResolved = false;
    const request = loadNotes().then((notes) => {
      requestResolved = true;
      return notes;
    });

    expect(requestResolved).toBe(false);
    await expect(request).resolves.toEqual([olderNote]);
    expect(requestResolved).toBe(true);
  });

  it('does not let an older save request overwrite a newer one', async () => {
    const olderRequest = saveNotes([olderNote]);
    const newerRequest = saveNotes([newerNote]);

    await Promise.all([olderRequest, newerRequest]);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      newerNote,
    ]);
  });
});
