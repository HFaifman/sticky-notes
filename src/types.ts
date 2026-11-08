export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export type Note = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: NoteColor;
  zIndex: number;
};

export type DragKind = 'move' | 'resize';
