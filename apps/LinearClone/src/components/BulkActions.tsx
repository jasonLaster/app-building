import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { bulkUpdateIssues, clearSelection } from '../slices/teamIssuesSlice';
import { STATUS_ORDER, STATUS_CONFIG, StatusIcon, PriorityIcon } from './IssueRow';
import './BulkActions.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const PRIORITY_CONFIG_MAP: Record<string, { label: string }> = {
  urgent: { label: 'Urgent' },
  high: { label: 'High' },
  medium: { label: 'Medium' },
  low: { label: 'Low' },
  none: { label: 'No Priority' },
};

type DropdownType = 'status' | 'priority' | 'assignee' | 'label' | null;

interface BulkActionsProps {
  teamId: string;
}

export default function BulkActions({ teamId }: BulkActionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedIds, members } = useSelector((state: RootState) => state.teamIssues);
  const { items: labels } = useSelector((state: RootState) => state.labels);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  if (selectedIds.length === 0) {
    return null;
  }

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  function handleStatusChange(status: string) {
    dispatch(bulkUpdateIssues({ issueIds: selectedIds, status, teamId }));
    setOpenDropdown(null);
  }

  function handlePriorityChange(priority: string) {
    dispatch(bulkUpdateIssues({ issueIds: selectedIds, priority, teamId }));
    setOpenDropdown(null);
  }

  function handleAssigneeChange(assigneeId: string | null) {
    dispatch(bulkUpdateIssues({ issueIds: selectedIds, assigneeId, teamId }));
    setOpenDropdown(null);
  }

  function handleLabelChange(labelId: string) {
    dispatch(bulkUpdateIssues({ issueIds: selectedIds, labelId, teamId }));
    setOpenDropdown(null);
  }

  return (
    <div className="bulk-actions" ref={toolbarRef} data-testid="bulk-actions-toolbar">
      <span className="bulk-actions-count" data-testid="bulk-actions-count">
        {selectedIds.length} selected
      </span>

      <div className="bulk-actions-buttons">
        <div className="bulk-actions-dropdown-wrapper">
          <button
            className="bulk-actions-btn"
            onClick={() => toggleDropdown('status')}
            data-testid="bulk-action-status"
          >
            Status
          </button>
          {openDropdown === 'status' && (
            <div className="bulk-actions-dropdown" data-testid="bulk-action-status-dropdown">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    className="bulk-actions-option"
                    onClick={() => handleStatusChange(s)}
                    data-testid={`bulk-status-option-${s}`}
                  >
                    <StatusIcon status={s} color={cfg.color} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bulk-actions-dropdown-wrapper">
          <button
            className="bulk-actions-btn"
            onClick={() => toggleDropdown('priority')}
            data-testid="bulk-action-priority"
          >
            Priority
          </button>
          {openDropdown === 'priority' && (
            <div className="bulk-actions-dropdown" data-testid="bulk-action-priority-dropdown">
              {PRIORITY_ORDER.map((p) => (
                <button
                  key={p}
                  className="bulk-actions-option"
                  onClick={() => handlePriorityChange(p)}
                  data-testid={`bulk-priority-option-${p}`}
                >
                  <PriorityIcon priority={p} />
                  <span>{PRIORITY_CONFIG_MAP[p].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bulk-actions-dropdown-wrapper">
          <button
            className="bulk-actions-btn"
            onClick={() => toggleDropdown('assignee')}
            data-testid="bulk-action-assignee"
          >
            Assignee
          </button>
          {openDropdown === 'assignee' && (
            <div className="bulk-actions-dropdown" data-testid="bulk-action-assignee-dropdown">
              <button
                className="bulk-actions-option"
                onClick={() => handleAssigneeChange(null)}
                data-testid="bulk-assignee-option-unassigned"
              >
                <span className="bulk-actions-avatar bulk-actions-avatar-empty">?</span>
                <span>Unassigned</span>
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  className="bulk-actions-option"
                  onClick={() => handleAssigneeChange(m.id)}
                  data-testid={`bulk-assignee-option-${m.id}`}
                >
                  <span className="bulk-actions-avatar">
                    {m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bulk-actions-dropdown-wrapper">
          <button
            className="bulk-actions-btn"
            onClick={() => toggleDropdown('label')}
            data-testid="bulk-action-label"
          >
            Label
          </button>
          {openDropdown === 'label' && (
            <div className="bulk-actions-dropdown" data-testid="bulk-action-label-dropdown">
              {labels.map((label) => (
                <button
                  key={label.id}
                  className="bulk-actions-option"
                  onClick={() => handleLabelChange(label.id)}
                  data-testid={`bulk-label-option-${label.id}`}
                >
                  <span className="bulk-actions-label-dot" style={{ backgroundColor: label.color }} />
                  <span>{label.name}</span>
                </button>
              ))}
              {labels.length === 0 && (
                <div className="bulk-actions-empty">No labels available</div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        className="bulk-actions-cancel"
        onClick={() => dispatch(clearSelection())}
        data-testid="bulk-actions-cancel"
      >
        Cancel
      </button>
    </div>
  );
}
