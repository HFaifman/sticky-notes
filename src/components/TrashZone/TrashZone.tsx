import { forwardRef } from 'react';
import './TrashZone.css';

type TrashZoneProps = {
  isDragging: boolean;
  isOver: boolean;
};

const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(function TrashZone(
  { isDragging, isOver },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`trash-zone ${isDragging && !isOver ? 'trash-ready' : ''} ${
        isOver ? 'trash-active' : ''
      }`}
      aria-label="Drop notes here to delete"
    >
      <span className="trash-icon">♲</span>
      <span>{isOver ? 'Release to delete' : 'Drag here to delete'}</span>
    </div>
  );
});

export default TrashZone;
