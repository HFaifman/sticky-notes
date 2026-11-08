import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import StickyNote from './StickyNote';
import type { Note } from '../../types';

const note: Note = {
  id: 'note-1',
  x: 40,
  y: 60,
  width: 220,
  height: 190,
  text: 'Buy milk',
  color: 'pink',
  zIndex: 3,
};

function renderNote(overrides: Partial<Parameters<typeof StickyNote>[0]> = {}) {
  const props = {
    note,
    isDragging: false,
    onStartDrag: vi.fn(),
    onMoveDrag: vi.fn(),
    onEndDrag: vi.fn(),
    onBringToFront: vi.fn(),
    onTextChange: vi.fn(),
    onColorChange: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  render(<StickyNote {...props} />);
  return props;
}

describe('StickyNote', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the note at its position, size, and stacking order', () => {
    renderNote();

    const article = screen.getByRole('article');
    expect(article).toHaveClass('note', 'note-pink');
    expect(article).not.toHaveClass('is-dragging');
    expect(article).toHaveStyle({
      left: '40px',
      top: '60px',
      width: '220px',
      height: '190px',
      zIndex: '3',
    });
    expect(screen.getByLabelText('Note text')).toHaveValue('Buy milk');
    expect(screen.getByLabelText('Change note color')).toHaveValue('pink');
  });

  it('marks the note while it is being dragged', () => {
    renderNote({ isDragging: true });

    expect(screen.getByRole('article')).toHaveClass('is-dragging');
  });

  it('reports text, color, and delete actions with the note id', () => {
    const props = renderNote();

    fireEvent.change(screen.getByLabelText('Note text'), { target: { value: 'Buy oat milk' } });
    fireEvent.change(screen.getByLabelText('Change note color'), { target: { value: 'blue' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    expect(props.onTextChange).toHaveBeenCalledWith('note-1', 'Buy oat milk');
    expect(props.onColorChange).toHaveBeenCalledWith('note-1', 'blue');
    expect(props.onDelete).toHaveBeenCalledWith('note-1');
  });

  it('starts a move from the header and a resize from the handle', () => {
    const props = renderNote();

    fireEvent.pointerDown(screen.getByText('NOTE'));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Resize note' }));

    expect(props.onStartDrag).toHaveBeenNthCalledWith(1, expect.anything(), note, 'move');
    expect(props.onStartDrag).toHaveBeenNthCalledWith(2, expect.anything(), note, 'resize');
  });

  it('does not start a drag from the header controls', () => {
    const props = renderNote();

    fireEvent.pointerDown(screen.getByLabelText('Change note color'));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Delete note' }));

    expect(props.onStartDrag).not.toHaveBeenCalled();
  });

  it('brings the note to front when clicked or when editing starts', () => {
    const props = renderNote();

    fireEvent.click(screen.getByRole('article'));
    fireEvent.pointerDown(screen.getByLabelText('Note text'));

    expect(props.onBringToFront).toHaveBeenCalledTimes(2);
    expect(props.onBringToFront).toHaveBeenCalledWith('note-1');
  });
});
