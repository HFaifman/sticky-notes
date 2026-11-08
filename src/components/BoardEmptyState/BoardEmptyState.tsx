import './BoardEmptyState.css';

type BoardEmptyStateProps = {
  isLoading: boolean;
};

function BoardEmptyState({ isLoading }: BoardEmptyStateProps) {
  if (isLoading) {
    return (
      <div className="empty-state" role="status">
        <h2>Loading notes...</h2>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <span>✎</span>
      </div>
      <h2>Your board is clear</h2>
      <p>Create a note and click anywhere here to get started.</p>
    </div>
  );
}

export default BoardEmptyState;
