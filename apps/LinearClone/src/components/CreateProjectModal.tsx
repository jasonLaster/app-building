import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProjectMember, ProjectTeamFilter } from '../slices/projectsSlice';
import './CreateProjectModal.css';

const PROJECT_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export interface CreateProjectFormData {
  name: string;
  description: string;
  status: string;
  leadId: string | null;
  targetDate: string | null;
  teamIds: string[];
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData) => Promise<void>;
  members: ProjectMember[];
  teams: ProjectTeamFilter[];
}

type DropdownType = 'status' | 'lead' | 'teams' | null;

export default function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  members,
  teams,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    status: 'planned',
    leadId: null,
    targetDate: null,
    teamIds: [],
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        status: 'planned',
        leadId: null,
        targetDate: null,
        teamIds: [],
      });
      setNameError(null);
      setSubmitting(false);
      setOpenDropdown(null);
      setLeadSearch('');
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  // Handle Escape key
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

  // Close dropdown on outside click within form
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  async function handleSubmit() {
    if (!formData.name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError(null);
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
    if (type === 'lead') setLeadSearch('');
  }

  function toggleTeam(teamId: string) {
    const current = formData.teamIds;
    if (current.includes(teamId)) {
      setFormData({ ...formData, teamIds: current.filter((id) => id !== teamId) });
    } else {
      setFormData({ ...formData, teamIds: [...current, teamId] });
    }
  }

  const selectedLead = members.find((m) => m.id === formData.leadId);
  const selectedTeams = teams.filter((t) => formData.teamIds.includes(t.id));
  const statusConfig = PROJECT_STATUSES.find((s) => s.value === formData.status) || PROJECT_STATUSES[0]!;

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(leadSearch.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="create-project-overlay"
      onClick={handleOverlayClick}
      data-testid="create-project-modal-overlay"
    >
      <div className="create-project-modal" data-testid="create-project-modal">
        <div className="cpm-header">
          <h2 className="cpm-title">Create Project</h2>
        </div>

        <div className="cpm-body" ref={formRef}>
          {/* Name */}
          <div className="cpm-field" data-testid="create-project-name-field">
            <label className="cpm-label">Name</label>
            <input
              ref={nameRef}
              type="text"
              className={`cpm-input ${nameError ? 'cpm-input-error' : ''}`}
              placeholder="Project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="create-project-name-input"
            />
            {nameError && (
              <span className="cpm-error" data-testid="create-project-name-error">{nameError}</span>
            )}
          </div>

          {/* Description */}
          <div className="cpm-field" data-testid="create-project-description-field">
            <label className="cpm-label">Description</label>
            <textarea
              className="cpm-textarea"
              placeholder="Project description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              data-testid="create-project-description-input"
            />
          </div>

          {/* Status */}
          <div className="cpm-field" data-testid="create-project-status-field">
            <label className="cpm-label">Status</label>
            <div className="cpm-dropdown-wrapper">
              <button
                className="cpm-select-btn"
                onClick={() => toggleDropdown('status')}
                data-testid="create-project-status-selector"
              >
                <span>{statusConfig.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {openDropdown === 'status' && (
                <div className="cpm-dropdown" data-testid="create-project-status-dropdown">
                  {PROJECT_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      className={`cpm-dropdown-option ${formData.status === s.value ? 'cpm-dropdown-option-active' : ''}`}
                      onClick={() => { setFormData({ ...formData, status: s.value }); setOpenDropdown(null); }}
                      data-testid={`create-project-status-option-${s.value}`}
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lead */}
          <div className="cpm-field" data-testid="create-project-lead-field">
            <label className="cpm-label">Lead</label>
            <div className="cpm-dropdown-wrapper">
              <button
                className="cpm-select-btn"
                onClick={() => toggleDropdown('lead')}
                data-testid="create-project-lead-selector"
              >
                {selectedLead ? (
                  <>
                    <span className="cpm-avatar">{getInitials(selectedLead.name)}</span>
                    <span>{selectedLead.name}</span>
                  </>
                ) : (
                  <span className="cpm-placeholder">No lead</span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {openDropdown === 'lead' && (
                <div className="cpm-dropdown cpm-dropdown-searchable" data-testid="create-project-lead-dropdown">
                  <input
                    className="cpm-search-input"
                    placeholder="Search members..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    autoFocus
                    data-testid="create-project-lead-search"
                  />
                  <button
                    className="cpm-dropdown-option"
                    onClick={() => { setFormData({ ...formData, leadId: null }); setOpenDropdown(null); }}
                    data-testid="create-project-lead-option-none"
                  >
                    <span className="cpm-avatar cpm-avatar-empty">?</span>
                    <span>No lead</span>
                  </button>
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      className={`cpm-dropdown-option ${formData.leadId === m.id ? 'cpm-dropdown-option-active' : ''}`}
                      onClick={() => { setFormData({ ...formData, leadId: m.id }); setOpenDropdown(null); }}
                      data-testid={`create-project-lead-option-${m.id}`}
                    >
                      <span className="cpm-avatar">{getInitials(m.name)}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target Date */}
          <div className="cpm-field" data-testid="create-project-target-date-field">
            <label className="cpm-label">Target date</label>
            <input
              type="date"
              className="cpm-date-input"
              value={formData.targetDate || ''}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value || null })}
              data-testid="create-project-target-date-input"
            />
          </div>

          {/* Teams */}
          <div className="cpm-field" data-testid="create-project-teams-field">
            <label className="cpm-label">Teams</label>
            {selectedTeams.length > 0 && (
              <div className="cpm-selected-teams" data-testid="create-project-selected-teams">
                {selectedTeams.map((t) => (
                  <span key={t.id} className="cpm-team-chip" data-testid={`create-project-team-chip-${t.id}`}>
                    {t.name}
                    <button
                      className="cpm-team-chip-remove"
                      onClick={() => toggleTeam(t.id)}
                      data-testid={`create-project-team-remove-${t.id}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="cpm-dropdown-wrapper">
              <button
                className="cpm-select-btn"
                onClick={() => toggleDropdown('teams')}
                data-testid="create-project-teams-selector"
              >
                <span className="cpm-placeholder">
                  {selectedTeams.length === 0 ? 'Select teams' : 'Add more teams'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {openDropdown === 'teams' && (
                <div className="cpm-dropdown" data-testid="create-project-teams-dropdown">
                  {teams.map((t) => {
                    const checked = formData.teamIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        className={`cpm-dropdown-option ${checked ? 'cpm-dropdown-option-active' : ''}`}
                        onClick={() => toggleTeam(t.id)}
                        data-testid={`create-project-team-option-${t.id}`}
                      >
                        <span>{t.name}</span>
                        {checked && (
                          <svg className="cpm-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    );
                  })}
                  {teams.length === 0 && (
                    <div className="cpm-dropdown-empty">No teams available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cpm-footer">
          <button
            className="cpm-cancel-btn"
            onClick={handleClose}
            data-testid="create-project-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="cpm-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="create-project-submit-btn"
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
