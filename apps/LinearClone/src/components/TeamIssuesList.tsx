import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { TeamIssue } from '../slices/teamIssuesSlice';
import { toggleIssueSelection, selectGroupIssues } from '../slices/teamIssuesSlice';
import { STATUS_ORDER, STATUS_CONFIG, StatusIcon, PriorityIcon, PRIORITY_CONFIG } from './IssueRow';
import IssueRow from './IssueRow';
import './TeamIssuesList.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const STATUS_SORT_MAP: Record<string, number> = {};
STATUS_ORDER.forEach((s, i) => { STATUS_SORT_MAP[s] = i; });
const PRIORITY_SORT_MAP: Record<string, number> = {};
PRIORITY_ORDER.forEach((p, i) => { PRIORITY_SORT_MAP[p] = i; });

interface IssueGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  issues: TeamIssue[];
}

function sortIssues(issues: TeamIssue[], sortBy: string): TeamIssue[] {
  return [...issues].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (PRIORITY_SORT_MAP[a.priority] ?? 4) - (PRIORITY_SORT_MAP[b.priority] ?? 4);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'status':
        return (STATUS_SORT_MAP[a.status] ?? 0) - (STATUS_SORT_MAP[b.status] ?? 0);
      default:
        return 0;
    }
  });
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface TeamIssuesListProps {
  issues: TeamIssue[];
  loading: boolean;
}

export default function TeamIssuesList({ issues, loading }: TeamIssuesListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedIds, groupBy, sortBy, members } = useSelector((state: RootState) => state.teamIssues);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const groups: IssueGroup[] = useMemo(() => {
    const sorted = sortIssues(issues, sortBy);

    if (groupBy === 'none') {
      return [{
        key: 'all',
        label: '',
        icon: null,
        issues: sorted,
      }];
    }

    if (groupBy === 'status') {
      const result: IssueGroup[] = [];
      for (const status of STATUS_ORDER) {
        const cfg = STATUS_CONFIG[status];
        const groupIssues = sorted.filter((i) => i.status === status);
        if (groupIssues.length > 0) {
          result.push({
            key: status,
            label: cfg.label,
            icon: <StatusIcon status={status} color={cfg.color} />,
            issues: groupIssues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'priority') {
      const result: IssueGroup[] = [];
      for (const priority of PRIORITY_ORDER) {
        const cfg = PRIORITY_CONFIG[priority];
        const groupIssues = sorted.filter((i) => i.priority === priority);
        if (groupIssues.length > 0) {
          result.push({
            key: priority,
            label: cfg.label,
            icon: <PriorityIcon priority={priority} />,
            issues: groupIssues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'assignee') {
      const result: IssueGroup[] = [];
      const assigneeMap = new Map<string, { name: string; issues: TeamIssue[] }>();

      for (const m of members) {
        assigneeMap.set(m.id, { name: m.name, issues: [] });
      }
      assigneeMap.set('unassigned', { name: 'Unassigned', issues: [] });

      for (const issue of sorted) {
        const key = issue.assigneeId || 'unassigned';
        const entry = assigneeMap.get(key);
        if (entry) {
          entry.issues.push(issue);
        } else {
          assigneeMap.set(key, { name: issue.assigneeName || 'Unknown', issues: [issue] });
        }
      }

      for (const [key, entry] of assigneeMap.entries()) {
        if (entry.issues.length > 0) {
          result.push({
            key,
            label: entry.name,
            icon: key === 'unassigned' ? (
              <span className="team-issues-list-avatar team-issues-list-avatar-empty">?</span>
            ) : (
              <span className="team-issues-list-avatar">{getInitials(entry.name)}</span>
            ),
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'project') {
      const result: IssueGroup[] = [];
      const projectMap = new Map<string, { name: string; issues: TeamIssue[] }>();

      projectMap.set('none', { name: 'No Project', issues: [] });

      for (const issue of sorted) {
        const key = issue.projectId || 'none';
        const entry = projectMap.get(key);
        if (entry) {
          entry.issues.push(issue);
        } else {
          projectMap.set(key, { name: issue.projectName || 'Unknown', issues: [issue] });
        }
      }

      for (const [key, entry] of projectMap.entries()) {
        if (entry.issues.length > 0) {
          result.push({
            key,
            label: entry.name,
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            ),
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'label') {
      const result: IssueGroup[] = [];
      const labelMap = new Map<string, { name: string; color: string; issues: TeamIssue[] }>();

      labelMap.set('none', { name: 'No Label', color: 'var(--color-text-tertiary)', issues: [] });

      for (const issue of sorted) {
        if (issue.labels.length === 0) {
          labelMap.get('none')!.issues.push(issue);
        } else {
          for (const label of issue.labels) {
            const entry = labelMap.get(label.id);
            if (entry) {
              entry.issues.push(issue);
            } else {
              labelMap.set(label.id, { name: label.name, color: label.color, issues: [issue] });
            }
          }
        }
      }

      for (const [key, entry] of labelMap.entries()) {
        if (entry.issues.length > 0) {
          result.push({
            key,
            label: entry.name,
            icon: <span className="team-issues-list-label-dot" style={{ backgroundColor: entry.color }} />,
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    return [];
  }, [issues, groupBy, sortBy, members]);

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCheckChange(issueId: string) {
    dispatch(toggleIssueSelection(issueId));
  }

  function handleGroupSelect(groupIssueIds: string[]) {
    dispatch(selectGroupIssues(groupIssueIds));
  }

  if (loading) {
    return (
      <div className="team-issues-list-loading" data-testid="team-issues-loading">
        Loading...
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="team-issues-list-empty" data-testid="team-issues-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p>No issues yet. Create your first issue to get started.</p>
      </div>
    );
  }

  if (groupBy === 'none') {
    return (
      <div className="team-issues-list" data-testid="team-issues-list">
        {groups[0]?.issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            showCheckbox
            checked={selectedIds.includes(issue.id)}
            onCheckChange={handleCheckChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="team-issues-list" data-testid="team-issues-list">
      {groups.map((group) => {
        const isCollapsed = !!collapsedGroups[group.key];
        const groupIssueIds = group.issues.map((i) => i.id);
        const allSelected = groupIssueIds.length > 0 && groupIssueIds.every((id) => selectedIds.includes(id));

        return (
          <div key={group.key} className="team-issues-group" data-testid={`team-issue-group-${group.key}`}>
            <div className="team-issues-group-header" data-testid={`team-issue-group-header-${group.key}`}>
              <label
                className="team-issues-group-select"
                onClick={(e) => e.stopPropagation()}
                data-testid={`team-issue-group-select-${group.key}`}
              >
                <input
                  type="checkbox"
                  className="team-issues-group-checkbox"
                  checked={allSelected}
                  onChange={() => handleGroupSelect(groupIssueIds)}
                />
              </label>
              <button
                className="team-issues-group-toggle"
                onClick={() => toggleGroup(group.key)}
              >
                <svg
                  className={`team-issues-group-chevron ${isCollapsed ? '' : 'team-issues-group-chevron-expanded'}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {group.icon}
                <span className="team-issues-group-label">{group.label}</span>
                <span className="team-issues-group-count">({group.issues.length})</span>
              </button>
            </div>
            {!isCollapsed && (
              <div className="team-issues-group-items" data-testid={`team-issue-group-items-${group.key}`}>
                {group.issues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    showCheckbox
                    checked={selectedIds.includes(issue.id)}
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
