import './AppHeader.css';

type AppHeaderProps = {
  noteCount: number;
};

function AppHeader({ noteCount }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">✳</span>
        <div>
          <h1>Sticky Notes</h1>
          <p>Your thoughts, all in one place.</p>
        </div>
      </div>
      <div className="topbar-meta">
        <span className="saved-indicator">
          <i /> Saved locally
        </span>
        <span className="note-count">
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </span>
      </div>
    </header>
  );
}

export default AppHeader;
