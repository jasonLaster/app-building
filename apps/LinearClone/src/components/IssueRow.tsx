import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { Issue } from '../slices/issuesSlice';
import { updateIssueStatus } from '../slices/issuesSlice';
import './IssueRow.css';

const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'var(--color-status-backlog)' },
  todo: { label: 'Todo', color: 'var(--color-status-todo)' },
  in_progress: { label: 'In Progress', color: 'var(--color-status-in-progress)' },
  in_review: { label: 'In Review', color: 'var(--color-status-in-review)' },
  done: { label: 'Done', color: 'var(--color-status-done)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-status-cancelled)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'var(--color-priority-urgent)' },
  high: { label: 'High', color: 'var(--color-priority-high)' },
  medium: { label: 'Medium', color: 'var(--color-priority-medium)' },
  low: { label: 'Low', color: 'var(--color-priority-low)' },
  none: { label: 'No Priority', color: 'var(--color-priority-none)' },
};

function StatusIcon({ status, color }: { status: string; color: string }) {
  switch (status) {
    case 'backlog':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'todo':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M7 1a6 6 0 0 1 0 12" fill={color} />
        </svg>
      );
    case 'in_review':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M7 1a6 6 0 0 1 0 12 6 6 0 0 1-6-6" fill={color} />
        </svg>
      );
    case 'done':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.5" fill={color} />
          <path d="M4.5 7l2 2 3.5-3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" />
          <path d="M5 5l4 4M9 5l-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.5" />
        </svg>
      );
  }
}

function PriorityIcon({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.none;
  const color = config.color;

  switch (priority) {
    case 'urgent':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'high':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );
    case 'medium':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'low':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="12" r="1.5" fill={color} />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <circle cx="19" cy="12" r="1.5" fill={color} />
        </svg>
      );
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface IssueRowProps {
  issue: Issue;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (issueId: string) => void;
}

export default function IssueRow({ issue, showCheckbox, checked, onCheckChange }: IssueRowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownOpen]);

  function handleTitleClick() {
    navigate(`/issue/${issue.id}`);
  }

  function handleStatusClick(e: React.MouseEvent) {
    e.stopPropagation();
    setStatusDropdownOpen(!statusDropdownOpen);
  }

  function handleStatusChange(newStatus: string) {
    dispatch(updateIssueStatus({ issueId: issue.id, status: newStatus }));
    setStatusDropdownOpen(false);
  }

  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.todo;
  const priorityConfig = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.none;

  return (
    <div className={`issue-row ${checked ? 'issue-row-selected' : ''}`} data-testid={`issue-row-${issue.id}`}>
      <div className="issue-row-left">
        {showCheckbox && (
          <label className="issue-row-checkbox-wrapper" data-testid={`issue-checkbox-${issue.id}`} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="issue-row-checkbox"
              checked={!!checked}
              onChange={() => onCheckChange?.(issue.id)}
            />
          </label>
        )}
        <span className="issue-row-priority" title={priorityConfig.label} data-testid={`issue-priority-${issue.id}`}>
          <PriorityIcon priority={issue.priority} />
        </span>
        <span className="issue-row-identifier" data-testid={`issue-identifier-${issue.id}`}>
          {issue.identifier}
        </span>
        <button
          className="issue-row-title"
          onClick={handleTitleClick}
          data-testid={`issue-title-${issue.id}`}
        >
          {issue.title}
        </button>
      </div>
      <div className="issue-row-right">
        {issue.labels.length > 0 && (
          <div className="issue-row-labels" data-testid={`issue-labels-${issue.id}`}>
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="issue-row-label-badge"
                style={{ borderColor: label.color }}
                data-testid={`issue-label-${issue.id}-${label.id}`}
              >
                <span className="issue-row-label-dot" style={{ backgroundColor: label.color }} />
                {label.name}
              </span>
            ))}
          </div>
        )}
        {issue.projectName && (
          <span className="issue-row-project" data-testid={`issue-project-${issue.id}`}>
            {issue.projectName}
          </span>
        )}
        {issue.dueDate && (
          <span className="issue-row-due-date" data-testid={`issue-due-date-${issue.id}`}>
            {formatDueDate(issue.dueDate)}
          </span>
        )}
        <div className="issue-row-status-wrapper" ref={dropdownRef}>
          <button
            className="issue-row-status-btn"
            onClick={handleStatusClick}
            title={statusConfig.label}
            data-testid={`issue-status-btn-${issue.id}`}
          >
            <StatusIcon status={issue.status} color={statusConfig.color} />
          </button>
          {statusDropdownOpen && (
            <div className="issue-row-status-dropdown" data-testid={`issue-status-dropdown-${issue.id}`}>
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    className={`issue-row-status-option ${issue.status === s ? 'issue-row-status-option-active' : ''}`}
                    onClick={() => handleStatusChange(s)}
                    data-testid={`issue-status-option-${s}`}
                  >
                    <StatusIcon status={s} color={cfg.color} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {issue.assigneeName && (
          <span
            className="issue-row-assignee"
            title={issue.assigneeName}
            data-testid={`issue-assignee-${issue.id}`}
          >
            {getInitials(issue.assigneeName)}
          </span>
        )}
      </div>
    </div>
  );
}

export { StatusIcon, PriorityIcon, STATUS_CONFIG, PRIORITY_CONFIG, STATUS_ORDER };
