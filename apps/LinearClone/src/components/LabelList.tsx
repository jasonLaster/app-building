import type { Label } from '../slices/labelsSlice';
import EditDeleteLabel from './EditDeleteLabel';
import './LabelList.css';

interface LabelListProps {
  labels: Label[];
  editingLabelId: string | null;
  onEditStart: (id: string) => void;
  onEditCancel: () => void;
  onSave: (id: string, name: string, color: string) => Promise<void>;
  onDeleteClick: (label: Label) => void;
}

export default function LabelList({
  labels,
  editingLabelId,
  onEditStart,
  onEditCancel,
  onSave,
  onDeleteClick,
}: LabelListProps) {
  if (labels.length === 0) {
    return (
      <div className="label-list-empty" data-testid="label-list-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <p>No labels yet. Create your first label to get started.</p>
      </div>
    );
  }

  return (
    <div className="label-list" data-testid="label-list">
      <div className="label-list-header">
        <span className="label-list-col label-list-col-name">Label</span>
        <span className="label-list-col label-list-col-count">Issues</span>
        <span className="label-list-col label-list-col-actions"></span>
      </div>
      {labels.map((label) => (
        <EditDeleteLabel
          key={label.id}
          label={label}
          isEditing={editingLabelId === label.id}
          onEditStart={() => onEditStart(label.id)}
          onEditCancel={onEditCancel}
          onSave={onSave}
          onDeleteClick={() => onDeleteClick(label)}
          existingNames={labels.filter((l) => l.id !== label.id).map((l) => l.name.toLowerCase())}
        />
      ))}
    </div>
  );
}
