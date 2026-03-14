import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchLabels, createLabel, updateLabel, deleteLabel } from '../slices/labelsSlice';
import type { Label } from '../slices/labelsSlice';
import LabelList from '../components/LabelList';
import CreateLabel from '../components/CreateLabel';
import './Labels.css';

export default function Labels() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: labels, loading } = useSelector((state: RootState) => state.labels);

  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Label | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchLabels());
    }
  }, [dispatch, token]);

  async function handleCreateLabel(name: string, color: string) {
    const result = await dispatch(createLabel({ name, color }));
    if (createLabel.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    setCreateFormOpen(false);
  }

  async function handleSaveLabel(id: string, name: string, color: string) {
    const result = await dispatch(updateLabel({ id, name, color }));
    if (updateLabel.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    setEditingLabelId(null);
  }

  function handleEditStart(id: string) {
    setEditingLabelId(id);
  }

  function handleEditCancel() {
    setEditingLabelId(null);
  }

  function handleDeleteClick(label: Label) {
    setEditingLabelId(null);
    setDeleteConfirm(label);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    setDeleting(true);
    await dispatch(deleteLabel(deleteConfirm.id));
    setDeleteConfirm(null);
    setDeleting(false);
  }

  function handleDeleteCancel() {
    setDeleteConfirm(null);
  }

  return (
    <div className="labels-page" data-testid="labels-page">
      <div className="labels-header">
        <h1 className="labels-title" data-testid="labels-title">Labels</h1>
        <button
          className="labels-create-btn"
          onClick={() => setCreateFormOpen(true)}
          data-testid="create-label-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Label
        </button>
      </div>

      <CreateLabel
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreateLabel}
        existingNames={labels.map((l) => l.name.toLowerCase())}
      />

      {loading ? (
        <div className="labels-loading" data-testid="labels-loading">
          Loading...
        </div>
      ) : (
        <LabelList
          labels={labels}
          editingLabelId={editingLabelId}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onSave={handleSaveLabel}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {deleteConfirm && (
        <div
          className="labels-delete-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleDeleteCancel(); }}
          data-testid="label-delete-overlay"
        >
          <div className="labels-delete-modal" data-testid="label-delete-modal">
            <h3 className="labels-delete-title">Delete Label</h3>
            <p className="labels-delete-message" data-testid="label-delete-message">
              Are you sure you want to delete the label &ldquo;{deleteConfirm.name}&rdquo;?
              {deleteConfirm.issue_count > 0 && (
                <> This label is used by {deleteConfirm.issue_count} {deleteConfirm.issue_count === 1 ? 'issue' : 'issues'}.</>
              )}
            </p>
            <div className="labels-delete-actions">
              <button
                className="labels-delete-cancel-btn"
                onClick={handleDeleteCancel}
                data-testid="label-delete-cancel-btn"
              >
                Cancel
              </button>
              <button
                className="labels-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                data-testid="label-delete-confirm-btn"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
