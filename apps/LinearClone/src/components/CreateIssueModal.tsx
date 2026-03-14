import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { closeCreateIssueModal } from '../slices/uiSlice';
import { createIssue } from '../slices/issuesSlice';
import { fetchTeamIssues } from '../slices/teamIssuesSlice';
import CreateIssueForm from './CreateIssueForm';
import type { CreateIssueFormData } from './CreateIssueForm';
import CreateIssueActions from './CreateIssueActions';
import './CreateIssueModal.css';

const INITIAL_FORM_DATA: CreateIssueFormData = {
  teamId: '',
  title: '',
  description: '',
  status: 'backlog',
  priority: 'none',
  assigneeId: null,
  labelIds: [],
  projectId: null,
  cycleId: null,
  dueDate: null,
  parentId: null,
};

export default function CreateIssueModal() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const params = useParams<{ teamId?: string }>();
  const { createIssueModalOpen } = useSelector((state: RootState) => state.ui);

  const [formData, setFormData] = useState<CreateIssueFormData>({ ...INITIAL_FORM_DATA });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdIdentifier, setCreatedIdentifier] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (createIssueModalOpen) {
      setFormData({ ...INITIAL_FORM_DATA });
      setTitleError(null);
      setSubmitting(false);
      setCreatedIdentifier(null);
    }
  }, [createIssueModalOpen]);

  const handleClose = useCallback(() => {
    dispatch(closeCreateIssueModal());
  }, [dispatch]);

  // Handle Escape key
  useEffect(() => {
    if (!createIssueModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createIssueModalOpen, handleClose]);

  async function handleSubmit() {
    if (!formData.title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    setSubmitting(true);

    try {
      const result = await dispatch(createIssue({
        teamId: formData.teamId,
        title: formData.title.trim(),
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId,
        labelIds: formData.labelIds,
        projectId: formData.projectId,
        cycleId: formData.cycleId,
        dueDate: formData.dueDate,
        parentId: formData.parentId,
      })).unwrap();

      // Show created identifier briefly
      setCreatedIdentifier(result.identifier);

      // Refetch team issues if on a team page
      if (formData.teamId) {
        dispatch(fetchTeamIssues(formData.teamId));
      }

      // Close after a brief delay to show identifier
      setTimeout(() => {
        dispatch(closeCreateIssueModal());
        // Navigate to team issues if we have a team
        if (formData.teamId && !params.teamId) {
          navigate(`/team/${formData.teamId}/issues`);
        }
      }, 1500);
    } catch {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    handleClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  if (!createIssueModalOpen) return null;

  return (
    <div
      className="create-issue-overlay"
      onClick={handleOverlayClick}
      data-testid="create-issue-modal-overlay"
    >
      <div className="create-issue-modal" data-testid="create-issue-modal">
        <div className="cim-header">
          <h2 className="cim-title">Create Issue</h2>
        </div>

        {createdIdentifier ? (
          <div className="cim-success" data-testid="create-issue-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-done)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-5" />
            </svg>
            <span>Created <strong>{createdIdentifier}</strong></span>
          </div>
        ) : (
          <>
            <div className="cim-body">
              <CreateIssueForm
                defaultTeamId={params.teamId}
                formData={formData}
                onFormChange={setFormData}
                titleError={titleError}
              />
            </div>
            <div className="cim-footer">
              <CreateIssueActions
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitting={submitting}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
