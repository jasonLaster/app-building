import { useState, useEffect, useCallback } from 'react';
import './CreateCycle.css';

interface CreateCycleProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; startDate: string; endDate: string }) => Promise<void>;
}

export default function CreateCycle({ open, onClose, onSubmit }: CreateCycleProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setStartDate('');
      setEndDate('');
      setNameError(null);
      setStartDateError(null);
      setEndDateError(null);
      setSubmitting(false);
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

  async function handleSubmit() {
    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!startDate) {
      setStartDateError('Start date is required');
      hasError = true;
    } else {
      setStartDateError(null);
    }

    if (!endDate) {
      setEndDateError('End date is required');
      hasError = true;
    } else {
      setEndDateError(null);
    }

    if (startDate && endDate && endDate <= startDate) {
      setEndDateError('End date must be after start date');
      hasError = true;
    }

    if (hasError) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), startDate, endDate });
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="create-cycle-overlay"
      onClick={handleOverlayClick}
      data-testid="create-cycle-modal-overlay"
    >
      <div className="create-cycle-modal" data-testid="create-cycle-modal">
        <div className="create-cycle-header">
          <h2 className="create-cycle-title">New Cycle</h2>
        </div>

        <div className="create-cycle-body">
          <div className="create-cycle-field">
            <label className="create-cycle-label" htmlFor="cycle-name">Name</label>
            <input
              id="cycle-name"
              type="text"
              className={`create-cycle-input ${nameError ? 'create-cycle-input-error' : ''}`}
              placeholder="e.g., Sprint 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="create-cycle-name-input"
            />
            {nameError && (
              <span className="create-cycle-error" data-testid="create-cycle-name-error">{nameError}</span>
            )}
          </div>

          <div className="create-cycle-field">
            <label className="create-cycle-label" htmlFor="cycle-start-date">Start date</label>
            <input
              id="cycle-start-date"
              type="date"
              className={`create-cycle-input ${startDateError ? 'create-cycle-input-error' : ''}`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="create-cycle-start-date-input"
            />
            {startDateError && (
              <span className="create-cycle-error" data-testid="create-cycle-start-date-error">{startDateError}</span>
            )}
          </div>

          <div className="create-cycle-field">
            <label className="create-cycle-label" htmlFor="cycle-end-date">End date</label>
            <input
              id="cycle-end-date"
              type="date"
              className={`create-cycle-input ${endDateError ? 'create-cycle-input-error' : ''}`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="create-cycle-end-date-input"
            />
            {endDateError && (
              <span className="create-cycle-error" data-testid="create-cycle-end-date-error">{endDateError}</span>
            )}
          </div>
        </div>

        <div className="create-cycle-footer">
          <button
            className="create-cycle-cancel-btn"
            onClick={handleClose}
            data-testid="create-cycle-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="create-cycle-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="create-cycle-submit-btn"
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
