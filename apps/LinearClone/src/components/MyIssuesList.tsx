import { useState, useMemo } from 'react';
import type { Issue } from '../slices/issuesSlice';
import { STATUS_ORDER, STATUS_CONFIG, StatusIcon } from './IssueRow';
import IssueRow from './IssueRow';
import './MyIssuesList.css';

interface MyIssuesListProps {
  issues: Issue[];
  loading: boolean;
}

interface StatusGroup {
  status: string;
  label: string;
  color: string;
  issues: Issue[];
}

export default function MyIssuesList({ issues, loading }: MyIssuesListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const groups: StatusGroup[] = useMemo(() => {
    const grouped: StatusGroup[] = [];
    for (const status of STATUS_ORDER) {
      const config = STATUS_CONFIG[status];
      const groupIssues = issues.filter((i) => i.status === status);
      if (groupIssues.length > 0) {
        grouped.push({
          status,
          label: config.label,
          color: config.color,
          issues: groupIssues,
        });
      }
    }
    return grouped;
  }, [issues]);

  function toggleGroup(status: string) {
    setCollapsedGroups((prev) => ({ ...prev, [status]: !prev[status] }));
  }

  if (loading) {
    return (
      <div className="my-issues-list-loading" data-testid="my-issues-loading">
        Loading...
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="my-issues-list-empty" data-testid="my-issues-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p>No issues assigned to you yet</p>
      </div>
    );
  }

  return (
    <div className="my-issues-list" data-testid="my-issues-list">
      {groups.map((group) => {
        const isCollapsed = !!collapsedGroups[group.status];
        return (
          <div key={group.status} className="my-issues-group" data-testid={`issue-group-${group.status}`}>
            <button
              className="my-issues-group-header"
              onClick={() => toggleGroup(group.status)}
              data-testid={`issue-group-header-${group.status}`}
            >
              <svg
                className={`my-issues-group-chevron ${isCollapsed ? '' : 'my-issues-group-chevron-expanded'}`}
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
              <StatusIcon status={group.status} color={group.color} />
              <span className="my-issues-group-label">{group.label}</span>
              <span className="my-issues-group-count">({group.issues.length})</span>
            </button>
            {!isCollapsed && (
              <div className="my-issues-group-items" data-testid={`issue-group-items-${group.status}`}>
                {group.issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
