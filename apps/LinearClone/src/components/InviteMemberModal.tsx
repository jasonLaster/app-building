import { useState, useEffect, useCallback, useRef } from 'react';
import './InviteMemberModal.css';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export default function InviteMemberModal({ open, onClose, onSubmit }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmail('');
      setError(null);
      setSubmitting(false);
      setTimeout(() => emailRef.current?.focus(), 50);
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
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Failed to invite member');
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
      className="invite-member-overlay"
      onClick={handleOverlayClick}
      data-testid="invite-member-modal-overlay"
    >
      <div className="invite-member-modal" data-testid="invite-member-modal">
        <div className="imm-header">
          <h2 className="imm-title">Invite Member</h2>
        </div>

        <div className="imm-body">
          <div className="imm-field" data-testid="invite-member-email-field">
            <label className="imm-label">Email address</label>
            <input
              ref={emailRef}
              type="email"
              className={`imm-input ${error ? 'imm-input-error' : ''}`}
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              data-testid="invite-member-email-input"
            />
            {error && (
              <span className="imm-error" data-testid="invite-member-error">
                {error}
              </span>
            )}
          </div>
        </div>

        <div className="imm-footer">
          <button
            className="imm-cancel-btn"
            onClick={handleClose}
            data-testid="invite-member-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="imm-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="invite-member-submit-btn"
          >
            {submitting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
