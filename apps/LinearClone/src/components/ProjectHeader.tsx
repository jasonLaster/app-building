import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { ProjectDetail, ProjectMember } from '../slices/projectDetailSlice';
import { updateProjectField } from '../slices/projectDetailSlice';
import './ProjectHeader.css';

const PROJECT_STATUS_ORDER = ['planned', 'in_progress', 'completed', 'cancelled'] as const;

const PROJECT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'project-header-badge-planned' },
  in_progress: { label: 'In Progress', className: 'project-header-badge-in-progress' },
  completed: { label: 'Completed', className: 'project-header-badge-completed' },
  cancelled: { label: 'Cancelled', className: 'project-header-badge-cancelled' },
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTargetDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ProjectHeaderProps {
  project: ProjectDetail;
  members: ProjectMember[];
  activeTab: 'issues' | 'overview';
  onTabChange: (tab: 'issues' | 'overview') => void;
}

export default function ProjectHeader({ project, members, activeTab, onTabChange }: ProjectHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);
  const [nameError, setNameError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Status dropdown
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Date editing
  const [editingDate, setEditingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Lead selector
  const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const leadRef = useRef<HTMLDivElement>(null);
  const leadSearchRef = useRef<HTMLInputElement>(null);

  // Sync name from props
  useEffect(() => {
    setNameValue(project.name);
  }, [project.name]);

  // Focus name input
  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  // Focus lead search
  useEffect(() => {
    if (leadDropdownOpen) {
      leadSearchRef.current?.focus();
    }
  }, [leadDropdownOpen]);

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownOpen]);

  // Close lead dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (leadRef.current && !leadRef.current.contains(e.target as Node)) {
        setLeadDropdownOpen(false);
        setLeadSearch('');
      }
    }
    if (leadDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leadDropdownOpen]);

  // Name handlers
  function handleNameClick() {
    setEditingName(true);
    setNameError(false);
  }

  async function saveName() {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    if (trimmed !== project.name) {
      await dispatch(updateProjectField({ projectId: project.id, field: 'name', value: trimmed }));
    }
    setEditingName(false);
    setNameError(false);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      setNameValue(project.name);
      setEditingName(false);
      setNameError(false);
    }
  }

  // Status handlers
  function handleStatusChange(newStatus: string) {
    dispatch(updateProjectField({ projectId: project.id, field: 'status', value: newStatus }));
    setStatusDropdownOpen(false);
  }

  // Date handlers
  function handleDateClick() {
    setEditingDate(true);
    setTimeout(() => {
      dateInputRef.current?.showPicker?.();
    }, 0);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value || null;
    dispatch(updateProjectField({ projectId: project.id, field: 'targetDate', value: val }));
    setEditingDate(false);
  }

  function handleClearDate() {
    dispatch(updateProjectField({ projectId: project.id, field: 'targetDate', value: null }));
    setEditingDate(false);
  }

  // Lead handlers
  function handleLeadChange(memberId: string | null) {
    dispatch(updateProjectField({ projectId: project.id, field: 'leadId', value: memberId }));
    setLeadDropdownOpen(false);
    setLeadSearch('');
  }

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const statusCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.planned;
  const percentage = project.totalIssues > 0
    ? Math.round((project.completedIssues / project.totalIssues) * 100)
    : 0;

  return (
    <div className="project-header" data-testid="project-header">
      {/* Name */}
      <div className="project-header-name-row">
        {editingName ? (
          <div className="project-header-name-edit">
            <input
              ref={nameInputRef}
              className={`project-header-name-input ${nameError ? 'project-header-name-input-error' : ''}`}
              value={nameValue}
              onChange={(e) => { setNameValue(e.target.value); setNameError(false); }}
              onBlur={saveName}
              onKeyDown={handleNameKeyDown}
              data-testid="project-header-name-input"
            />
            {nameError && (
              <span className="project-header-name-error" data-testid="project-header-name-error">
                Name is required
              </span>
            )}
          </div>
        ) : (
          <h1
            className="project-header-name"
            onClick={handleNameClick}
            data-testid="project-header-name"
          >
            {project.name}
          </h1>
        )}
      </div>

      {/* Meta row: status, progress, target date, lead */}
      <div className="project-header-meta">
        {/* Status badge */}
        <div className="project-header-status-wrapper" ref={statusRef}>
          <button
            className={`project-header-status-badge ${statusCfg.className}`}
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            data-testid="project-header-status-badge"
          >
            {statusCfg.label}
          </button>
          {statusDropdownOpen && (
            <div className="project-header-status-dropdown" data-testid="project-header-status-dropdown">
              {PROJECT_STATUS_ORDER.map((s) => {
                const cfg = PROJECT_STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    className={`project-header-status-option ${project.status === s ? 'project-header-status-option-active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    data-testid={`project-header-status-option-${s}`}
                  >
                    <span className={`project-header-status-dot ${cfg.className}`} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="project-header-progress" data-testid="project-header-progress">
          <div className="project-header-progress-bar">
            <div
              className={`project-header-progress-fill ${percentage === 100 ? 'project-header-progress-complete' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="project-header-progress-text" data-testid="project-header-progress-text">
            {project.completedIssues} of {project.totalIssues} issues completed
          </span>
        </div>

        {/* Target Date */}
        <div className="project-header-date-wrapper">
          {editingDate ? (
            <div className="project-header-date-edit">
              <input
                ref={dateInputRef}
                type="date"
                className="project-header-date-input"
                defaultValue={project.targetDate || ''}
                onChange={handleDateChange}
                onBlur={() => setEditingDate(false)}
                data-testid="project-header-date-input"
              />
              {project.targetDate && (
                <button
                  className="project-header-date-clear"
                  onMouseDown={(e) => { e.preventDefault(); handleClearDate(); }}
                  data-testid="project-header-date-clear"
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
            <button
              className="project-header-date-btn"
              onClick={handleDateClick}
              data-testid="project-header-date-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {project.targetDate ? formatTargetDate(project.targetDate) : 'No target date'}
              </span>
            </button>
          )}
        </div>

        {/* Lead selector */}
        <div className="project-header-lead-wrapper" ref={leadRef}>
          <button
            className="project-header-lead-btn"
            onClick={() => setLeadDropdownOpen(!leadDropdownOpen)}
            data-testid="project-header-lead-btn"
          >
            {project.leadName ? (
              <>
                <span className="project-header-lead-avatar">
                  {getInitials(project.leadName)}
                </span>
                <span className="project-header-lead-name">{project.leadName}</span>
              </>
            ) : (
              <span className="project-header-no-lead">No lead</span>
            )}
          </button>
          {leadDropdownOpen && (
            <div className="project-header-lead-dropdown" data-testid="project-header-lead-dropdown">
              <input
                ref={leadSearchRef}
                className="project-header-lead-search"
                placeholder="Search members..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                data-testid="project-header-lead-search"
              />
              <button
                className="project-header-lead-option"
                onClick={() => handleLeadChange(null)}
                data-testid="project-header-lead-option-remove"
              >
                <span className="project-header-lead-avatar project-header-lead-avatar-empty">?</span>
                <span>Remove lead</span>
              </button>
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  className={`project-header-lead-option ${project.leadId === m.id ? 'project-header-lead-option-active' : ''}`}
                  onClick={() => handleLeadChange(m.id)}
                  data-testid={`project-header-lead-option-${m.id}`}
                >
                  <span className="project-header-lead-avatar">
                    {getInitials(m.name)}
                  </span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="project-header-tabs" data-testid="project-header-tabs">
        <button
          className={`project-header-tab ${activeTab === 'issues' ? 'project-header-tab-active' : ''}`}
          onClick={() => onTabChange('issues')}
          data-testid="project-tab-issues"
        >
          Issues
        </button>
        <button
          className={`project-header-tab ${activeTab === 'overview' ? 'project-header-tab-active' : ''}`}
          onClick={() => onTabChange('overview')}
          data-testid="project-tab-overview"
        >
          Overview
        </button>
      </div>
    </div>
  );
}
