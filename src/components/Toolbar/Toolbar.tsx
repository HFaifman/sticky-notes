import type { useNoteDraft } from '../../hooks';
import ColorPicker from '../ColorPicker';
import SizeFields from '../SizeFields';
import './Toolbar.css';

type ToolbarProps = {
  draft: ReturnType<typeof useNoteDraft>;
  placementMode: boolean;
  isLoading: boolean;
  onPlacementModeChange: (enabled: boolean) => void;
};

function Toolbar({ draft, placementMode, isLoading, onPlacementModeChange }: ToolbarProps) {
  return (
    <aside className="toolbar" aria-label="Note creation controls">
      <div className="toolbar-heading">
        <span className="eyebrow">WORKSPACE</span>
        <h2>Create a note</h2>
        <p>Choose a size and color, then place it on the board.</p>
      </div>

      <SizeFields
        width={draft.width}
        height={draft.height}
        isWidthInvalid={draft.isWidthInvalid}
        isHeightInvalid={draft.isHeightInvalid}
        onWidthChange={(value) => {
          draft.setWidth(value);
          onPlacementModeChange(false);
        }}
        onHeightChange={(value) => {
          draft.setHeight(value);
          onPlacementModeChange(false);
        }}
      />

      <ColorPicker selectedColor={draft.color} onSelect={draft.setColor} />

      <button
        className={`primary-button ${placementMode ? 'is-active' : ''}`}
        onClick={() => onPlacementModeChange(!placementMode)}
        disabled={isLoading || draft.isSizeInvalid}
      >
        <span>＋</span>
        {placementMode ? 'Cancel placement' : 'Place a note'}
      </button>
      {placementMode && (
        <p className="placement-hint">Click anywhere on the board to place your note.</p>
      )}

      <div className="toolbar-divider" />
      <div className="tips">
        <span className="tips-icon">✦</span>
        <div>
          <strong>Quick tips</strong>
          <p>
            Drag a note by its top bar. Pull the bottom-right corner to resize. Drag a note to the
            bin to delete it.
          </p>
        </div>
      </div>
      <div className="keyboard-hint">
        <span>DESIGNED FOR DESKTOP</span>
        <span>↗</span>
      </div>
    </aside>
  );
}

export default Toolbar;
