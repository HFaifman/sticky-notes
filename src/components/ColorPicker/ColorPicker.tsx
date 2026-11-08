import { NOTE_COLORS } from '../../constants';
import type { NoteColor } from '../../types';
import './ColorPicker.css';

type ColorPickerProps = {
  selectedColor: NoteColor;
  onSelect: (color: NoteColor) => void;
};

function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <>
      <label className="field-label color-label">NOTE COLOR</label>
      <div className="color-options" role="group" aria-label="New note color">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            className={`color-swatch ${color} ${selectedColor === color ? 'active' : ''}`}
            aria-label={`${color} note`}
            aria-pressed={selectedColor === color}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
    </>
  );
}

export default ColorPicker;
