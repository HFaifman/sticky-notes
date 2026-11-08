import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

const STORAGE_KEY = 'sticky-notes.v1';

function setRect(element: Element, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 100,
    y: 50,
    top: 50,
    left: 100,
    right: 900,
    bottom: 750,
    width: 800,
    height: 700,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

async function createNote(
  options: {
    width?: number;
    height?: number;
    color?: string;
    x?: number;
    y?: number;
  } = {},
) {
  await waitFor(() => {
    expect(screen.getByLabelText('Sticky notes board')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.change(screen.getByLabelText('Width'), {
    target: { value: String(options.width ?? 220) },
  });
  fireEvent.change(screen.getByLabelText('Height'), {
    target: { value: String(options.height ?? 190) },
  });
  if (options.color) {
    fireEvent.click(screen.getByRole('button', { name: `${options.color} note` }));
  }
  fireEvent.click(screen.getByRole('button', { name: /Place a note/ }));
  fireEvent.click(screen.getByLabelText('Sticky notes board'), {
    clientX: options.x ?? 300,
    clientY: options.y ?? 200,
  });
  return screen.getByRole('article');
}

function pointer(
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  target: Element,
  x: number,
  y: number,
) {
  fireEvent[type](target, {
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
    clientX: x,
    clientY: y,
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('Sticky Notes', () => {
  it('validates width and height and disables note placement for invalid sizes', async () => {
    render(<App />);
    const widthInput = screen.getByLabelText('Width');
    const heightInput = screen.getByLabelText('Height');
    const placeButton = screen.getByRole('button', { name: /Place a note/ });

    await waitFor(() => expect(placeButton).toBeEnabled());

    fireEvent.change(widthInput, { target: { value: '0' } });
    expect(widthInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Width must be a whole number/)).toBeInTheDocument();
    expect(placeButton).toBeDisabled();

    fireEvent.change(widthInput, { target: { value: '501' } });
    expect(screen.getByText(/between 140 and 500 pixels/)).toBeInTheDocument();
    expect(placeButton).toBeDisabled();

    fireEvent.change(widthInput, { target: { value: '220' } });
    expect(widthInput).toHaveAttribute('aria-invalid', 'false');
    expect(placeButton).toBeEnabled();

    fireEvent.change(heightInput, { target: { value: '0' } });
    expect(heightInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Height must be a whole number/)).toBeInTheDocument();
    expect(placeButton).toBeDisabled();

    fireEvent.change(heightInput, { target: { value: '501' } });
    expect(placeButton).toBeDisabled();

    fireEvent.change(heightInput, { target: { value: '190' } });
    expect(heightInput).toHaveAttribute('aria-invalid', 'false');
    expect(placeButton).toBeEnabled();
  });

  it.each([
    ['empty width', 'Width', ''],
    ['negative width', 'Width', '-1'],
    ['fractional width', 'Width', '140.5'],
    ['empty height', 'Height', ''],
    ['negative height', 'Height', '-1'],
    ['fractional height', 'Height', '120.5'],
  ])('prevents placement with %s', async (_description, label, value) => {
    render(<App />);
    const placeButton = screen.getByRole('button', { name: /Place a note/ });

    await waitFor(() => expect(placeButton).toBeEnabled());
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

    expect(placeButton).toBeDisabled();
  });

  it('creates a note at the clicked position using the selected size and color', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });

    const note = await createNote({
      width: 300,
      height: 240,
      color: 'pink',
      x: 400,
      y: 300,
    });

    expect(note).toHaveClass('note-pink');
    expect(note).toHaveStyle({
      width: '300px',
      height: '240px',
      left: '150px',
      top: '130px',
    });
    expect(screen.getByText('1 note')).toBeInTheDocument();
    expect(screen.getByText('Saved locally')).toBeInTheDocument();
  });

  it('allows the user to edit note text and change its color', async () => {
    render(<App />);
    const note = await createNote();
    const editor = within(note).getByRole('textbox', { name: 'Note text' });

    fireEvent.change(editor, { target: { value: 'Ship the sticky notes app' } });
    fireEvent.change(within(note).getByLabelText('Change note color'), {
      target: { value: 'blue' },
    });

    expect(editor).toHaveValue('Ship the sticky notes app');
    expect(note).toHaveClass('note-blue');
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')[0]).toMatchObject({
        text: 'Ship the sticky notes app',
        color: 'blue',
      });
    });
  });

  it('moves a note by dragging its header and prevents negative coordinates', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });
    const note = await createNote({ x: 300, y: 200 });
    const header = note.querySelector('.note-header') as HTMLElement;

    pointer('pointerDown', header, 300, 200);
    pointer('pointerMove', note, 340, 225);
    expect(note).toHaveStyle({ left: '130px', top: '80px' });
    pointer('pointerUp', note, 340, 225);

    pointer('pointerDown', header, 340, 225);
    pointer('pointerMove', note, -500, -500);
    expect(note).toHaveStyle({ left: '0px', top: '0px' });
    pointer('pointerUp', note, -500, -500);
  });

  it('keeps a dragged note inside the board at its right and bottom edges', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });
    const note = await createNote({
      width: 220,
      height: 190,
      x: 300,
      y: 200,
    });
    const header = note.querySelector('.note-header') as HTMLElement;

    pointer('pointerDown', header, 300, 200);
    pointer('pointerMove', note, 2300, 2200);

    expect(note).toHaveStyle({ left: '580px', top: '510px' });
    expect(note.getBoundingClientRect().right).toBeLessThanOrEqual(900);
    expect(note.getBoundingClientRect().bottom).toBeLessThanOrEqual(750);

    pointer('pointerUp', note, 2300, 2200);
  });

  it('does not allow resizing a note beyond the board right or bottom edges', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });
    const note = await createNote({
      width: 220,
      height: 190,
      x: 700,
      y: 550,
    });
    const handle = within(note).getByRole('button', { name: 'Resize note' });

    pointer('pointerDown', handle, 700, 550);
    pointer('pointerMove', note, 1700, 1550);

    expect(note).toHaveStyle({ width: '310px', height: '295px' });
    pointer('pointerUp', note, 1700, 1550);
  });

  it('resizes a note by dragging its resize handle and enforces minimum dimensions', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });
    const note = await createNote({ width: 220, height: 190 });
    const handle = within(note).getByRole('button', { name: 'Resize note' });

    pointer('pointerDown', handle, 300, 200);
    pointer('pointerMove', note, 380, 260);
    expect(note).toHaveStyle({ width: '300px', height: '250px' });
    pointer('pointerUp', note, 380, 260);

    pointer('pointerDown', handle, 380, 260);
    pointer('pointerMove', note, 100, 100);
    expect(note).toHaveStyle({ width: '160px', height: '130px' });
    pointer('pointerUp', note, 100, 100);
  });

  it('deletes a note using its delete control', async () => {
    render(<App />);
    const note = await createNote();
    fireEvent.click(within(note).getByRole('button', { name: 'Delete note' }));

    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText('Your board is clear')).toBeInTheDocument();
    expect(screen.getByText('0 notes')).toBeInTheDocument();
  });

  it('deletes a note when it is dragged into the top-left trash zone', async () => {
    render(<App />);
    const board = screen.getByLabelText('Sticky notes board');
    await waitFor(() => expect(board).toHaveAttribute('aria-busy', 'false'));
    setRect(board, {
      left: 100,
      top: 50,
      right: 900,
      bottom: 750,
      width: 800,
      height: 700,
    });
    const trash = screen.getByLabelText('Drop notes here to delete');
    expect(board).toContainElement(trash);
    setRect(trash, {
      left: 114,
      top: 64,
      right: 235,
      bottom: 104,
      width: 121,
      height: 40,
    });
    const note = await createNote();
    const header = note.querySelector('.note-header') as HTMLElement;

    pointer('pointerDown', header, 300, 200);
    pointer('pointerMove', note, 150, 80);
    expect(trash).toHaveClass('trash-active');
    pointer('pointerUp', note, 150, 80);

    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('brings a clicked note to the front', async () => {
    render(<App />);
    const first = await createNote();
    fireEvent.click(screen.getByRole('button', { name: /Place a note/ }));
    fireEvent.click(screen.getByLabelText('Sticky notes board'), {
      clientX: 500,
      clientY: 400,
    });
    const second = screen.getAllByRole('article')[1];

    const firstZ = Number(first.style.zIndex);
    const secondZ = Number(second.style.zIndex);
    fireEvent.click(first);

    expect(Number(first.style.zIndex)).toBeGreaterThan(secondZ);
    expect(Number(first.style.zIndex)).toBeGreaterThan(firstZ);
  });

  it('restores valid notes from local storage on load', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'saved-note',
          x: 24,
          y: 36,
          width: 260,
          height: 180,
          text: 'Previously saved',
          color: 'green',
          zIndex: 7,
        },
      ]),
    );
    render(<App />);

    const note = await screen.findByRole('article');
    expect(note).toHaveClass('note-green');
    expect(note).toHaveStyle({
      left: '24px',
      top: '36px',
      width: '260px',
      height: '180px',
    });
    expect(within(note).getByRole('textbox', { name: 'Note text' })).toHaveValue(
      'Previously saved',
    );
  });

  it('ignores malformed and invalid local storage data', async () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const { unmount } = render(<App />);
    await waitFor(() => {
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(screen.getByText('Your board is clear')).toBeInTheDocument();
    });
    unmount();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'valid',
          x: 0,
          y: 0,
          width: 200,
          height: 150,
          text: 'Keep me',
          color: 'yellow',
          zIndex: 1,
        },
        {
          id: 'invalid-color',
          x: 0,
          y: 0,
          width: 200,
          height: 150,
          text: 'Drop me',
          color: 'orange',
          zIndex: 2,
        },
        {
          id: 'invalid-shape',
          x: 'wrong',
          y: 0,
          width: 200,
          height: 150,
          text: 'Drop me too',
          color: 'yellow',
          zIndex: 3,
        },
      ]),
    );
    render(<App />);

    expect(await screen.findAllByRole('article')).toHaveLength(1);
    expect(await screen.findByRole('textbox', { name: 'Note text' })).toHaveValue('Keep me');
  });
});
