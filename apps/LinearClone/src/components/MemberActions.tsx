import { useState } from 'react';
import type { Member } from '../slices/membersSlice';
import './MemberActions.css';

interface MemberActionsProps {
  member: Member;
  isSelf: boolean;
  isLastAdmin: boolean;
  onChangeRole: (memberId: string, role: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export default function MemberActions({
  member,
  isSelf,
  isLastAdmin,
  onChangeRole,
  onRemove,
}: MemberActionsProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleRoleChange(newRole: string) {
    if (newRole === member.role) {
      setRoleDropdownOpen(false);
      return;
    }
    setUpdating(true);
    try {
      await onChangeRole(member.id, newRole);
    } finally {
      setUpdating(false);
      setRoleDropdownOpen(false);
    }
  }

  async function handleConfirmRemove() {
    setUpdating(true);
    try {
      await onRemove(member.id);
    } finally {
      setUpdating(false);
      setConfirmRemoveOpen(false);
    }
  }

  const roleDisabled = isSelf && isLastAdmin;

  return (
    <div className="member-actions" data-testid={`member-actions-${member.id}`}>
      <div className="member-actions-role-wrapper">
        <button
          className="member-actions-role-btn"
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          disabled={roleDisabled || updating}
          title={roleDisabled ? 'Cannot demote the last Admin' : 'Change role'}
          data-testid={`member-role-dropdown-btn-${member.id}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {roleDropdownOpen && (
          <>
          <div className="dropdown-mask" onClick={() => setRoleDropdownOpen(false)} />
          <div className="member-actions-role-dropdown" data-testid={`member-role-dropdown-${member.id}`}>
            <button
              className={`member-actions-role-option ${member.role === 'admin' ? 'member-actions-role-option-active' : ''}`}
              onClick={() => handleRoleChange('admin')}
              data-testid={`member-role-option-admin-${member.id}`}
            >
              <span>Admin</span>
              {member.role === 'admin' && (
                <svg className="member-actions-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
            <button
              className={`member-actions-role-option ${member.role === 'member' ? 'member-actions-role-option-active' : ''}`}
              onClick={() => handleRoleChange('member')}
              data-testid={`member-role-option-member-${member.id}`}
            >
              <span>Member</span>
              {member.role === 'member' && (
                <svg className="member-actions-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
          </div>
          </>
        )}
      </div>

      {!isSelf && (
        <button
          className="member-actions-remove-btn"
          onClick={() => setConfirmRemoveOpen(true)}
          disabled={updating}
          title="Remove member"
          data-testid={`member-remove-btn-${member.id}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}

      {confirmRemoveOpen && (
        <div
          className="member-actions-confirm-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmRemoveOpen(false); }}
          data-testid={`member-remove-confirm-overlay-${member.id}`}
        >
          <div className="member-actions-confirm-dialog" data-testid={`member-remove-confirm-dialog-${member.id}`}>
            <p className="member-actions-confirm-text">
              Are you sure you want to remove <strong>{member.name}</strong> from the workspace?
            </p>
            <div className="member-actions-confirm-buttons">
              <button
                className="member-actions-confirm-cancel"
                onClick={() => setConfirmRemoveOpen(false)}
                data-testid={`member-remove-confirm-cancel-${member.id}`}
              >
                Cancel
              </button>
              <button
                className="member-actions-confirm-remove"
                onClick={handleConfirmRemove}
                disabled={updating}
                data-testid={`member-remove-confirm-btn-${member.id}`}
              >
                {updating ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
