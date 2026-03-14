import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { Issue, IssueLabel } from '../slices/issuesSlice';
import type { TeamMember, TeamProject, TeamCycle } from '../slices/issueDetailSlice';
import { updateIssueField } from '../slices/issueDetailSlice';
import { StatusIcon, PriorityIcon, STATUS_CONFIG, PRIORITY_CONFIG, STATUS_ORDER } from './IssueRow';
import './IssueSidebar.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;

interface IssueSidebarProps {
  issue: Issue;
  members: TeamMember[];
  projects: TeamProject[];
  cycles: TeamCycle[];
  allLabels: IssueLabel[];
}

type DropdownType = 'status' | 'priority' | 'assignee' | 'labels' | 'project' | 'cycle' | 'dueDate' | null;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IssueSidebar({ issue, members, projects, cycles, allLabels }: IssueSidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
    if (type === 'assignee') setAssigneeSearch('');
    if (type === 'project') setProjectSearch('');
  }

  function handleStatusChange(status: string) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'status', value: status }));
    setOpenDropdown(null);
  }

  function handlePriorityChange(priority: string) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'priority', value: priority }));
    setOpenDropdown(null);
  }

  function handleAssigneeChange(assigneeId: string | null) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'assigneeId', value: assigneeId }));
    setOpenDropdown(null);
  }

  function handleLabelToggle(labelId: string) {
    const currentIds = issue.labels.map((l) => l.id);
    let newIds: string[];
    if (currentIds.includes(labelId)) {
      newIds = currentIds.filter((id) => id !== labelId);
    } else {
      newIds = [...currentIds, labelId];
    }
    dispatch(updateIssueField({ issueId: issue.id, field: 'labels', value: null, labelIds: newIds }));
  }

  function handleProjectChange(projectId: string | null) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'projectId', value: projectId }));
    setOpenDropdown(null);
  }

  function handleCycleChange(cycleId: string | null) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'cycleId', value: cycleId }));
    setOpenDropdown(null);
  }

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value || null;
    dispatch(updateIssueField({ issueId: issue.id, field: 'dueDate', value: val }));
  }

  function handleClearDueDate() {
    dispatch(updateIssueField({ issueId: issue.id, field: 'dueDate', value: null }));
  }

  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.todo;
  const priorityConfig = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.none;
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const issueLabelIds = issue.labels.map((l) => l.id);

  return (
    <div className="issue-sidebar" ref={sidebarRef} data-testid="issue-sidebar">
      {/* Status */}
      <div className="sidebar-field" data-testid="sidebar-status-field">
        <label className="sidebar-label">Status</label>
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('status')}
            data-testid="sidebar-status-btn"
          >
            <StatusIcon status={issue.status} color={statusConfig.color} />
            <span>{statusConfig.label}</span>
          </button>
          {openDropdown === 'status' && (
            <div className="sidebar-dropdown" data-testid="sidebar-status-dropdown">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    className={`sidebar-dropdown-option ${issue.status === s ? 'sidebar-dropdown-option-active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    data-testid={`sidebar-status-option-${s}`}
                  >
                    <StatusIcon status={s} color={cfg.color} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Priority */}
      <div className="sidebar-field" data-testid="sidebar-priority-field">
        <label className="sidebar-label">Priority</label>
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('priority')}
            data-testid="sidebar-priority-btn"
          >
            <PriorityIcon priority={issue.priority} />
            <span>{priorityConfig.label}</span>
          </button>
          {openDropdown === 'priority' && (
            <div className="sidebar-dropdown" data-testid="sidebar-priority-dropdown">
              {PRIORITY_ORDER.map((p) => {
                const cfg = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.none;
                return (
                  <button
                    key={p}
                    className={`sidebar-dropdown-option ${issue.priority === p ? 'sidebar-dropdown-option-active' : ''}`}
                    onClick={() => handlePriorityChange(p)}
                    data-testid={`sidebar-priority-option-${p}`}
                  >
                    <PriorityIcon priority={p} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assignee */}
      <div className="sidebar-field" data-testid="sidebar-assignee-field">
        <label className="sidebar-label">Assignee</label>
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('assignee')}
            data-testid="sidebar-assignee-btn"
          >
            {issue.assigneeName ? (
              <>
                <span className="sidebar-avatar">{getInitials(issue.assigneeName)}</span>
                <span>{issue.assigneeName}</span>
              </>
            ) : (
              <span className="sidebar-placeholder">No assignee</span>
            )}
          </button>
          {openDropdown === 'assignee' && (
            <div className="sidebar-dropdown sidebar-dropdown-searchable" data-testid="sidebar-assignee-dropdown">
              <input
                className="sidebar-search-input"
                placeholder="Search members..."
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                autoFocus
                data-testid="sidebar-assignee-search"
              />
              <button
                className="sidebar-dropdown-option"
                onClick={() => handleAssigneeChange(null)}
                data-testid="sidebar-assignee-option-none"
              >
                <span className="sidebar-avatar sidebar-avatar-empty">?</span>
                <span>Unassign</span>
              </button>
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  className={`sidebar-dropdown-option ${issue.assigneeId === m.id ? 'sidebar-dropdown-option-active' : ''}`}
                  onClick={() => handleAssigneeChange(m.id)}
                  data-testid={`sidebar-assignee-option-${m.id}`}
                >
                  <span className="sidebar-avatar">{getInitials(m.name)}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="sidebar-field" data-testid="sidebar-labels-field">
        <label className="sidebar-label">Labels</label>
        {issue.labels.length > 0 && (
          <div className="sidebar-labels-list" data-testid="sidebar-labels-list">
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="sidebar-label-badge"
                style={{ borderColor: label.color }}
                data-testid={`sidebar-label-badge-${label.id}`}
              >
                <span className="sidebar-label-dot" style={{ backgroundColor: label.color }} />
                {label.name}
              </span>
            ))}
          </div>
        )}
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('labels')}
            data-testid="sidebar-labels-btn"
          >
            <span className="sidebar-placeholder">
              {issue.labels.length === 0 ? 'No labels' : 'Edit labels'}
            </span>
          </button>
          {openDropdown === 'labels' && (
            <div className="sidebar-dropdown" data-testid="sidebar-labels-dropdown">
              {allLabels.map((label) => (
                <button
                  key={label.id}
                  className={`sidebar-dropdown-option ${issueLabelIds.includes(label.id) ? 'sidebar-dropdown-option-active' : ''}`}
                  onClick={() => handleLabelToggle(label.id)}
                  data-testid={`sidebar-label-option-${label.id}`}
                >
                  <span className="sidebar-label-dot" style={{ backgroundColor: label.color }} />
                  <span>{label.name}</span>
                  {issueLabelIds.includes(label.id) && (
                    <svg className="sidebar-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
              {allLabels.length === 0 && (
                <div className="sidebar-dropdown-empty">No labels available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project */}
      <div className="sidebar-field" data-testid="sidebar-project-field">
        <label className="sidebar-label">Project</label>
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('project')}
            data-testid="sidebar-project-btn"
          >
            <span className={issue.projectName ? '' : 'sidebar-placeholder'}>
              {issue.projectName || 'No project'}
            </span>
          </button>
          {openDropdown === 'project' && (
            <div className="sidebar-dropdown sidebar-dropdown-searchable" data-testid="sidebar-project-dropdown">
              <input
                className="sidebar-search-input"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                autoFocus
                data-testid="sidebar-project-search"
              />
              <button
                className="sidebar-dropdown-option"
                onClick={() => handleProjectChange(null)}
                data-testid="sidebar-project-option-none"
              >
                <span>No project</span>
              </button>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  className={`sidebar-dropdown-option ${issue.projectId === p.id ? 'sidebar-dropdown-option-active' : ''}`}
                  onClick={() => handleProjectChange(p.id)}
                  data-testid={`sidebar-project-option-${p.id}`}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cycle */}
      <div className="sidebar-field" data-testid="sidebar-cycle-field">
        <label className="sidebar-label">Cycle</label>
        <div className="sidebar-dropdown-wrapper">
          <button
            className="sidebar-select-btn"
            onClick={() => toggleDropdown('cycle')}
            data-testid="sidebar-cycle-btn"
          >
            <span className={issue.cycleId ? '' : 'sidebar-placeholder'}>
              {issue.cycleId
                ? cycles.find((c) => c.id === issue.cycleId)?.name || 'Unknown cycle'
                : 'No cycle'}
            </span>
          </button>
          {openDropdown === 'cycle' && (
            <div className="sidebar-dropdown" data-testid="sidebar-cycle-dropdown">
              <button
                className="sidebar-dropdown-option"
                onClick={() => handleCycleChange(null)}
                data-testid="sidebar-cycle-option-none"
              >
                <span>No cycle</span>
              </button>
              {cycles.map((c) => (
                <button
                  key={c.id}
                  className={`sidebar-dropdown-option ${issue.cycleId === c.id ? 'sidebar-dropdown-option-active' : ''}`}
                  onClick={() => handleCycleChange(c.id)}
                  data-testid={`sidebar-cycle-option-${c.id}`}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="sidebar-field" data-testid="sidebar-due-date-field">
        <label className="sidebar-label">Due date</label>
        <div className="sidebar-date-wrapper">
          <input
            type="date"
            className="sidebar-date-input"
            value={issue.dueDate || ''}
            onChange={handleDueDateChange}
            data-testid="sidebar-due-date-input"
          />
          {issue.dueDate && (
            <div className="sidebar-date-display">
              <span data-testid="sidebar-due-date-display">{formatDueDate(issue.dueDate)}</span>
              <button
                className="sidebar-date-clear"
                onClick={handleClearDueDate}
                data-testid="sidebar-due-date-clear"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Created */}
      <div className="sidebar-field sidebar-field-readonly" data-testid="sidebar-created-field">
        <label className="sidebar-label">Created</label>
        <span className="sidebar-readonly-value" data-testid="sidebar-created-value">
          {formatDate(issue.createdAt)}
        </span>
      </div>

      {/* Updated */}
      <div className="sidebar-field sidebar-field-readonly" data-testid="sidebar-updated-field">
        <label className="sidebar-label">Updated</label>
        <span className="sidebar-readonly-value" data-testid="sidebar-updated-value">
          {formatDate(issue.updatedAt)}
        </span>
      </div>
    </div>
  );
}
