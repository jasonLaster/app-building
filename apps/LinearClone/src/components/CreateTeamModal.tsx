import { useState, useEffect, useCallback, useRef } from 'react';
import './CreateTeamModal.css';

export interface CreateTeamFormData {
  name: string;
  identifier: string;
  description: string;
}

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamFormData) => Promise<void>;
}

export default function CreateTeamModal({ open, onClose, onSubmit }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setIdentifier('');
      setDescription('');
      setNameError(null);
      setIdentifierError(null);
      setServerError(null);
      setSubmitting(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  function handleIdentifierChange(value: string) {
    const upper = value.toUpperCase().replace(/[^A-Z]/g, '');
    setIdentifier(upper.slice(0, 5));
    setIdentifierError(null);
  }

  async function handleSubmit() {
    let hasError = false;
    setServerError(null);

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!identifier.trim()) {
      setIdentifierError('Identifier prefix is required');
      hasError = true;
    } else if (identifier.length < 2) {
      setIdentifierError('Identifier prefix must be between 2 and 5 characters');
      hasError = true;
    } else {
      setIdentifierError(null);
    }

    if (hasError) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), identifier, description: description.trim() });
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else if (typeof err === 'string') {
        setServerError(err);
      } else {
        setServerError('Failed to create team');
      }
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (!open) return null;

  return (
    <div
      className="create-team-overlay"
      onClick={handleOverlayClick}
      data-testid="create-team-modal-overlay"
    >
      <div className="create-team-modal" data-testid="create-team-modal" onKeyDown={handleKeyDown}>
        <div className="ctm-header">
          <h2 className="ctm-title">Create Team</h2>
        </div>

        <div className="ctm-body">
          <div className="ctm-field" data-testid="create-team-name-field">
            <label className="ctm-label">Name</label>
            <input
              ref={nameRef}
              type="text"
              className={`ctm-input ${nameError ? 'ctm-input-error' : ''}`}
              placeholder="Team name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null); }}
              data-testid="create-team-name-input"
            />
            {nameError && (
              <span className="ctm-error" data-testid="create-team-name-error">{nameError}</span>
            )}
          </div>

          <div className="ctm-field" data-testid="create-team-identifier-field">
            <label className="ctm-label">Identifier prefix</label>
            <input
              type="text"
              className={`ctm-input ${identifierError ? 'ctm-input-error' : ''}`}
              placeholder="e.g. ENG"
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              maxLength={5}
              data-testid="create-team-identifier-input"
            />
            {identifierError && (
              <span className="ctm-error" data-testid="create-team-identifier-error">{identifierError}</span>
            )}
          </div>

          <div className="ctm-field" data-testid="create-team-description-field">
            <label className="ctm-label">Description</label>
            <textarea
              className="ctm-textarea"
              placeholder="What does this team do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="create-team-description-input"
            />
          </div>

          {serverError && (
            <div className="ctm-server-error" data-testid="create-team-server-error">
              {serverError}
            </div>
          )}
        </div>

        <div className="ctm-footer">
          <button
            className="ctm-cancel-btn"
            onClick={handleClose}
            data-testid="create-team-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="ctm-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="create-team-submit-btn"
          >
            {submitting ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
