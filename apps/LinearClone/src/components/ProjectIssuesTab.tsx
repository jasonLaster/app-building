import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { Issue } from '../slices/issuesSlice';
import {
  toggleProjectIssueSelection,
  clearProjectIssueSelection,
  bulkUpdateProjectIssues,
} from '../slices/projectDetailSlice';
import IssueRow from './IssueRow';
import { StatusIcon, PriorityIcon, STATUS_CONFIG, STATUS_ORDER } from './IssueRow';
import './ProjectIssuesTab.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const PRIORITY_CONFIG_MAP: Record<string, { label: string }> = {
  urgent: { label: 'Urgent' },
  high: { label: 'High' },
  medium: { label: 'Medium' },
  low: { label: 'Low' },
  none: { label: 'No Priority' },
};

type DropdownType = 'status' | 'priority' | 'assignee' | 'label' | null;

interface TeamGroup {
  teamId: string;
  teamName: string;
  issues: Issue[];
}

export default function ProjectIssuesTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { project, issues, selectedIssueIds, members, labels } = useSelector(
    (state: RootState) => state.projectDetail
  );
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set());
  const [bulkDropdown, setBulkDropdown] = useState<DropdownType>(null);

  // Group issues by team
  const teamGroups: TeamGroup[] = [];
  const teamMap = new Map<string, TeamGroup>();
  for (const issue of issues) {
    let group = teamMap.get(issue.teamId);
    if (!group) {
      group = { teamId: issue.teamId, teamName: issue.teamName, issues: [] };
      teamMap.set(issue.teamId, group);
      teamGroups.push(group);
    }
    group.issues.push(issue);
  }

  function toggleTeamCollapse(teamId: string) {
    setCollapsedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  function handleCheckChange(issueId: string) {
    dispatch(toggleProjectIssueSelection(issueId));
  }

  function handleBulkStatus(status: string) {
    if (project) {
      dispatch(bulkUpdateProjectIssues({ issueIds: selectedIssueIds, status, projectId: project.id }));
    }
    setBulkDropdown(null);
  }

  function handleBulkPriority(priority: string) {
    if (project) {
      dispatch(bulkUpdateProjectIssues({ issueIds: selectedIssueIds, priority, projectId: project.id }));
    }
    setBulkDropdown(null);
  }

  function handleBulkAssignee(assigneeId: string | null) {
    if (project) {
      dispatch(bulkUpdateProjectIssues({ issueIds: selectedIssueIds, assigneeId, projectId: project.id }));
    }
    setBulkDropdown(null);
  }

  function handleBulkLabel(labelId: string) {
    if (project) {
      dispatch(bulkUpdateProjectIssues({ issueIds: selectedIssueIds, labelId, projectId: project.id }));
    }
    setBulkDropdown(null);
  }

  if (issues.length === 0) {
    return (
      <div className="project-issues-tab" data-testid="project-issues-tab">
        <div className="project-issues-empty" data-testid="project-issues-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No issues in this project yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-issues-tab" data-testid="project-issues-tab">
      {/* Bulk actions toolbar */}
      {selectedIssueIds.length > 0 && (
        <div className="project-issues-bulk" data-testid="project-issues-bulk-toolbar">
          <span className="project-issues-bulk-count" data-testid="project-issues-bulk-count">
            {selectedIssueIds.length} selected
          </span>
          <div className="project-issues-bulk-buttons">
            <div className="project-issues-bulk-dd-wrapper">
              <button
                className="project-issues-bulk-btn"
                onClick={() => setBulkDropdown(bulkDropdown === 'status' ? null : 'status')}
                data-testid="project-bulk-action-status"
              >
                Status
              </button>
              {bulkDropdown === 'status' && (
                <div className="project-issues-bulk-dropdown" data-testid="project-bulk-status-dropdown">
                  {STATUS_ORDER.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        className="project-issues-bulk-option"
                        onClick={() => handleBulkStatus(s)}
                        data-testid={`project-bulk-status-option-${s}`}
                      >
                        <StatusIcon status={s} color={cfg.color} />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="project-issues-bulk-dd-wrapper">
              <button
                className="project-issues-bulk-btn"
                onClick={() => setBulkDropdown(bulkDropdown === 'priority' ? null : 'priority')}
                data-testid="project-bulk-action-priority"
              >
                Priority
              </button>
              {bulkDropdown === 'priority' && (
                <div className="project-issues-bulk-dropdown" data-testid="project-bulk-priority-dropdown">
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      className="project-issues-bulk-option"
                      onClick={() => handleBulkPriority(p)}
                      data-testid={`project-bulk-priority-option-${p}`}
                    >
                      <PriorityIcon priority={p} />
                      <span>{PRIORITY_CONFIG_MAP[p].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="project-issues-bulk-dd-wrapper">
              <button
                className="project-issues-bulk-btn"
                onClick={() => setBulkDropdown(bulkDropdown === 'assignee' ? null : 'assignee')}
                data-testid="project-bulk-action-assignee"
              >
                Assignee
              </button>
              {bulkDropdown === 'assignee' && (
                <div className="project-issues-bulk-dropdown" data-testid="project-bulk-assignee-dropdown">
                  <button
                    className="project-issues-bulk-option"
                    onClick={() => handleBulkAssignee(null)}
                    data-testid="project-bulk-assignee-option-unassigned"
                  >
                    <span className="project-issues-bulk-avatar project-issues-bulk-avatar-empty">?</span>
                    <span>Unassigned</span>
                  </button>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      className="project-issues-bulk-option"
                      onClick={() => handleBulkAssignee(m.id)}
                      data-testid={`project-bulk-assignee-option-${m.id}`}
                    >
                      <span className="project-issues-bulk-avatar">
                        {m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="project-issues-bulk-dd-wrapper">
              <button
                className="project-issues-bulk-btn"
                onClick={() => setBulkDropdown(bulkDropdown === 'label' ? null : 'label')}
                data-testid="project-bulk-action-label"
              >
                Label
              </button>
              {bulkDropdown === 'label' && (
                <div className="project-issues-bulk-dropdown" data-testid="project-bulk-label-dropdown">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      className="project-issues-bulk-option"
                      onClick={() => handleBulkLabel(label.id)}
                      data-testid={`project-bulk-label-option-${label.id}`}
                    >
                      <span className="project-issues-bulk-label-dot" style={{ backgroundColor: label.color }} />
                      <span>{label.name}</span>
                    </button>
                  ))}
                  {labels.length === 0 && (
                    <div className="project-issues-bulk-empty">No labels available</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="project-issues-bulk-cancel"
            onClick={() => dispatch(clearProjectIssueSelection())}
            data-testid="project-issues-deselect-all"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Team groups */}
      {teamGroups.map((group) => {
        const isCollapsed = collapsedTeams.has(group.teamId);
        return (
          <div key={group.teamId} className="project-issues-team-group" data-testid={`project-team-group-${group.teamId}`}>
            <button
              className="project-issues-team-header"
              onClick={() => toggleTeamCollapse(group.teamId)}
              data-testid={`project-team-header-${group.teamId}`}
            >
              <svg
                className={`project-issues-team-chevron ${isCollapsed ? 'project-issues-team-chevron-collapsed' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span className="project-issues-team-name">{group.teamName}</span>
              <span className="project-issues-team-count" data-testid={`project-team-count-${group.teamId}`}>
                ({group.issues.length})
              </span>
            </button>
            {!isCollapsed && (
              <div className="project-issues-team-list" data-testid={`project-team-issues-${group.teamId}`}>
                {group.issues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    showCheckbox
                    checked={selectedIssueIds.includes(issue.id)}
                    onCheckChange={handleCheckChange}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
