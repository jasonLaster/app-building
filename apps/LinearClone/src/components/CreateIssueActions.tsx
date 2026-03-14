import './CreateIssueActions.css';

interface CreateIssueActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function CreateIssueActions({ onSubmit, onCancel, submitting }: CreateIssueActionsProps) {
  return (
    <div className="create-issue-actions" data-testid="create-issue-actions">
      <button
        className="cia-cancel-btn"
        onClick={onCancel}
        disabled={submitting}
        data-testid="create-issue-cancel-btn"
      >
        Cancel
      </button>
      <button
        className="cia-submit-btn"
        onClick={onSubmit}
        disabled={submitting}
        data-testid="create-issue-submit-btn"
      >
        {submitting ? 'Creating...' : 'Create Issue'}
      </button>
    </div>
  );
}
