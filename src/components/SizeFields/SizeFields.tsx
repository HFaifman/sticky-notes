import { MAX_NOTE_HEIGHT, MAX_NOTE_WIDTH, MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from '../../constants';
import './SizeFields.css';

type SizeFieldsProps = {
  width: string;
  height: string;
  isWidthInvalid: boolean;
  isHeightInvalid: boolean;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
};

function SizeFields({
  width,
  height,
  isWidthInvalid,
  isHeightInvalid,
  onWidthChange,
  onHeightChange,
}: SizeFieldsProps) {
  return (
    <>
      <label className="field-label">SIZE</label>
      <div className="size-fields">
        <label>
          <span>Width</span>
          <input
            type="number"
            min={MIN_NOTE_WIDTH}
            max={MAX_NOTE_WIDTH}
            step="1"
            value={width}
            aria-invalid={isWidthInvalid}
            aria-describedby={isWidthInvalid ? 'width-error' : undefined}
            onChange={(event) => onWidthChange(event.target.value)}
          />
        </label>
        <label>
          <span>Height</span>
          <input
            type="number"
            min={MIN_NOTE_HEIGHT}
            max={MAX_NOTE_HEIGHT}
            step="1"
            value={height}
            aria-invalid={isHeightInvalid}
            aria-describedby={isHeightInvalid ? 'height-error' : undefined}
            onChange={(event) => onHeightChange(event.target.value)}
          />
        </label>
      </div>
      {isWidthInvalid && (
        <p className="field-error" id="width-error" role="alert">
          Width must be a whole number between {MIN_NOTE_WIDTH} and {MAX_NOTE_WIDTH} pixels.
        </p>
      )}
      {isHeightInvalid && (
        <p className="field-error" id="height-error" role="alert">
          Height must be a whole number between {MIN_NOTE_HEIGHT} and {MAX_NOTE_HEIGHT} pixels.
        </p>
      )}
    </>
  );
}

export default SizeFields;
