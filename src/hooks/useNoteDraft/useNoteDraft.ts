import { useState } from 'react';
import {
  DEFAULT_NOTE_SIZE,
  MAX_NOTE_HEIGHT,
  MAX_NOTE_WIDTH,
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
} from '../../constants';
import type { NoteColor } from '../../types';
import { isValidDimension } from '../../utils/validateDimension';

/** Holds the creation form's raw input values and derives their validation state. */
export function useNoteDraft() {
  const [color, setColor] = useState<NoteColor>('yellow');
  const [width, setWidth] = useState(DEFAULT_NOTE_SIZE.width);
  const [height, setHeight] = useState(DEFAULT_NOTE_SIZE.height);
  const isWidthInvalid = !isValidDimension(width, MIN_NOTE_WIDTH, MAX_NOTE_WIDTH);
  const isHeightInvalid = !isValidDimension(height, MIN_NOTE_HEIGHT, MAX_NOTE_HEIGHT);

  return {
    color,
    setColor,
    width,
    setWidth,
    height,
    setHeight,
    isWidthInvalid,
    isHeightInvalid,
    isSizeInvalid: isWidthInvalid || isHeightInvalid,
  };
}
