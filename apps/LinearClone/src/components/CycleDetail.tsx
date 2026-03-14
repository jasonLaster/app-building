import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { CycleIssue } from '../slices/cyclesSlice';
import {
  setCycleGroupBy,
  setCycleSortBy,
  toggleCycleIssueSelection,
  selectCycleGroupIssues,
  clearCycleSelection,
} from '../slices/cyclesSlice';
import { updateIssueStatus } from '../slices/issuesSlice';
import { bulkUpdateIssues } from '../slices/teamIssuesSlice';
import IssueRow from './IssueRow';
import { STATUS_ORDER, STATUS_CONFIG, StatusIcon, PriorityIcon, PRIORITY_CONFIG } from './IssueRow';
import BurndownChart from './BurndownChart';
import './CycleDetail.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const STATUS_SORT_MAP: Record<string, number> = {};
STATUS_ORDER.forEach((s, i) => { STATUS_SORT_MAP[s] = i; });
const PRIORITY_SORT_MAP: Record<string, number> = {};
PRIORITY_ORDER.forEach((p, i) => { PRIORITY_SORT_MAP[p] = i; });

const GROUP_OPTIONS: Array<{ value: 'status' | 'priority' | 'assignee' | 'project' | 'label' | 'none'; label: string }> = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'project', label: 'Project' },
  { value: 'label', label: 'Label' },
  { value: 'none', label: 'None' },
];

const SORT_OPTIONS: Array<{ value: 'priority' | 'created' | 'updated' | 'status'; label: string }> = [
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created date' },
  { value: 'updated', label: 'Updated date' },
  { value: 'status', label: 'Status' },
];

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function sortIssues(issues: CycleIssue[], sortBy: string): CycleIssue[] {
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

interface IssueGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  issues: CycleIssue[];
}

const ALL_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'Todo', in_progress: 'In Progress',
  in_review: 'In Review', done: 'Done', cancelled: 'Cancelled',
};
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low', none: 'No Priority',
};

export default function CycleDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    cycleDetail, cycleIssues, cycleMembers, burndown,
    detailLoading, groupBy, sortBy, selectedIds,
  } = useSelector((state: RootState) => state.cycles);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  const statusFilterRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {
        setStatusFilterOpen(false);
      }
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setGroupDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) {
        setBulkStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredIssues = useMemo(() => {
    if (selectedStatuses.length === 0) return cycleIssues;
    return cycleIssues.filter((i) => selectedStatuses.includes(i.status));
  }, [cycleIssues, selectedStatuses]);

  const groups: IssueGroup[] = useMemo(() => {
    const sorted = sortIssues(filteredIssues, sortBy);

    if (groupBy === 'none') {
      return [{ key: 'all', label: '', icon: null, issues: sorted }];
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
      const assigneeMap = new Map<string, { name: string; issues: CycleIssue[] }>();
      for (const m of cycleMembers) {
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
            icon: key === 'unassigned'
              ? <span className="cycle-detail-avatar cycle-detail-avatar-empty">?</span>
              : <span className="cycle-detail-avatar">{getInitials(entry.name)}</span>,
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'project') {
      const result: IssueGroup[] = [];
      const projectMap = new Map<string, { name: string; issues: CycleIssue[] }>();
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
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    if (groupBy === 'label') {
      const result: IssueGroup[] = [];
      const labelMap = new Map<string, { name: string; color: string; issues: CycleIssue[] }>();
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
            icon: <span className="cycle-detail-label-dot" style={{ backgroundColor: entry.color }} />,
            issues: entry.issues,
          });
        }
      }
      return result;
    }

    return [];
  }, [filteredIssues, groupBy, sortBy, cycleMembers]);

  if (!cycleDetail) return null;

  if (detailLoading) {
    return (
      <div className="cycle-detail-loading" data-testid="cycle-detail-loading">
        Loading...
      </div>
    );
  }

  const totalIssues = cycleIssues.length;
  const completedIssues = cycleIssues.filter((i) => i.status === 'done').length;
  const inProgressIssues = cycleIssues.filter((i) => i.status === 'in_progress' || i.status === 'in_review').length;
  const remainingIssues = totalIssues - completedIssues - inProgressIssues;
  const completionPct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 1000) / 10 : 0;

  const currentGroupLabel = GROUP_OPTIONS.find((o) => o.value === groupBy)?.label || 'Status';
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Priority';

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCheckChange(issueId: string) {
    dispatch(toggleCycleIssueSelection(issueId));
  }

  function handleGroupSelect(ids: string[]) {
    dispatch(selectCycleGroupIssues(ids));
  }

  function toggleStatusFilter(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  function handleBulkStatusChange(status: string) {
    if (cycleDetail) {
      dispatch(bulkUpdateIssues({
        issueIds: selectedIds,
        status,
        teamId: cycleDetail.teamId,
      }));
    }
    dispatch(clearCycleSelection());
    setBulkStatusOpen(false);
  }

  return (
    <div className="cycle-detail" data-testid="cycle-detail">
      <div className="cycle-detail-header" data-testid="cycle-detail-header">
        <div className="cycle-detail-header-top">
          <h2 className="cycle-detail-name" data-testid="cycle-detail-name">{cycleDetail.name}</h2>
          <span className="cycle-detail-date-range" data-testid="cycle-detail-dates">
            {formatDateRange(cycleDetail.startDate, cycleDetail.endDate)}
          </span>
        </div>
      </div>

      <div className="cycle-detail-stats" data-testid="cycle-detail-stats">
        <div className="cycle-detail-stat" data-testid="cycle-stat-total">
          <span className="cycle-detail-stat-value">{totalIssues}</span>
          <span className="cycle-detail-stat-label">Total</span>
        </div>
        <div className="cycle-detail-stat cycle-detail-stat-done" data-testid="cycle-stat-completed">
          <span className="cycle-detail-stat-value">{completedIssues}</span>
          <span className="cycle-detail-stat-label">Completed</span>
        </div>
        <div className="cycle-detail-stat cycle-detail-stat-progress" data-testid="cycle-stat-in-progress">
          <span className="cycle-detail-stat-value">{inProgressIssues}</span>
          <span className="cycle-detail-stat-label">In Progress</span>
        </div>
        <div className="cycle-detail-stat" data-testid="cycle-stat-remaining">
          <span className="cycle-detail-stat-value">{remainingIssues}</span>
          <span className="cycle-detail-stat-label">Remaining</span>
        </div>
      </div>

      <div className="cycle-detail-progress" data-testid="cycle-detail-progress">
        <div className="cycle-detail-progress-bar">
          <div
            className="cycle-detail-progress-fill"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="cycle-detail-progress-text">
          {completedIssues} of {totalIssues} ({completionPct}%)
        </span>
      </div>

      <BurndownChart
        burndown={burndown}
        startDate={cycleDetail.startDate}
        endDate={cycleDetail.endDate}
      />

      <div className="cycle-detail-toolbar">
        <div className="cycle-detail-filters">
          <div className="cycle-detail-filter-control" ref={statusFilterRef}>
            <button
              className={`cycle-detail-filter-btn ${selectedStatuses.length > 0 ? 'cycle-detail-filter-btn-active' : ''}`}
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              data-testid="cycle-status-filter-btn"
            >
              Status{selectedStatuses.length > 0 ? ` (${selectedStatuses.length})` : ''}
            </button>
            {statusFilterOpen && (
              <div className="cycle-detail-filter-dropdown" data-testid="cycle-status-filter-dropdown">
                {ALL_STATUSES.map((status) => (
                  <label key={status} className="cycle-detail-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      data-testid={`cycle-status-filter-${status}`}
                    />
                    <span>{STATUS_LABELS[status]}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cycle-detail-group-sort">
          <div className="cycle-detail-filter-control" ref={groupRef}>
            <button
              className="cycle-detail-filter-btn"
              onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
              data-testid="cycle-group-by-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="9" y2="18" />
              </svg>
              Group: {currentGroupLabel}
            </button>
            {groupDropdownOpen && (
              <div className="cycle-detail-filter-dropdown" data-testid="cycle-group-by-dropdown">
                {GROUP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`cycle-detail-dropdown-option ${groupBy === opt.value ? 'cycle-detail-dropdown-option-active' : ''}`}
                    onClick={() => {
                      dispatch(setCycleGroupBy(opt.value));
                      setGroupDropdownOpen(false);
                    }}
                    data-testid={`cycle-group-by-option-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="cycle-detail-filter-control" ref={sortRef}>
            <button
              className="cycle-detail-filter-btn"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              data-testid="cycle-sort-by-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 9 6" />
                <polyline points="3 12 15 12" />
                <polyline points="3 18 21 18" />
              </svg>
              Sort: {currentSortLabel}
            </button>
            {sortDropdownOpen && (
              <div className="cycle-detail-filter-dropdown" data-testid="cycle-sort-by-dropdown">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`cycle-detail-dropdown-option ${sortBy === opt.value ? 'cycle-detail-dropdown-option-active' : ''}`}
                    onClick={() => {
                      dispatch(setCycleSortBy(opt.value));
                      setSortDropdownOpen(false);
                    }}
                    data-testid={`cycle-sort-by-option-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="cycle-detail-bulk-bar" data-testid="cycle-bulk-actions">
          <span className="cycle-detail-bulk-count">{selectedIds.length} selected</span>
          <div className="cycle-detail-bulk-actions" ref={bulkRef}>
            <button
              className="cycle-detail-bulk-btn"
              onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
              data-testid="cycle-bulk-status-btn"
            >
              Set Status
            </button>
            {bulkStatusOpen && (
              <div className="cycle-detail-filter-dropdown" data-testid="cycle-bulk-status-dropdown">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    className="cycle-detail-dropdown-option"
                    onClick={() => handleBulkStatusChange(status)}
                    data-testid={`cycle-bulk-status-${status}`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="cycle-detail-bulk-btn cycle-detail-bulk-clear"
            onClick={() => dispatch(clearCycleSelection())}
            data-testid="cycle-bulk-clear"
          >
            Clear
          </button>
        </div>
      )}

      <div className="cycle-detail-issues" data-testid="cycle-detail-issues">
        {filteredIssues.length === 0 ? (
          <div className="cycle-detail-no-issues" data-testid="cycle-detail-no-issues">
            <p>No issues in this cycle</p>
          </div>
        ) : groupBy === 'none' ? (
          groups[0]?.issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              showCheckbox
              checked={selectedIds.includes(issue.id)}
              onCheckChange={handleCheckChange}
            />
          ))
        ) : (
          groups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.key];
            const groupIssueIds = group.issues.map((i) => i.id);
            const allSelected = groupIssueIds.length > 0 && groupIssueIds.every((id) => selectedIds.includes(id));

            return (
              <div key={group.key} className="cycle-detail-group" data-testid={`cycle-issue-group-${group.key}`}>
                <div className="cycle-detail-group-header" data-testid={`cycle-issue-group-header-${group.key}`}>
                  <label className="cycle-detail-group-select" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="cycle-detail-group-checkbox"
                      checked={allSelected}
                      onChange={() => handleGroupSelect(groupIssueIds)}
                    />
                  </label>
                  <button
                    className="cycle-detail-group-toggle"
                    onClick={() => toggleGroup(group.key)}
                  >
                    <svg
                      className={`cycle-detail-group-chevron ${isCollapsed ? '' : 'cycle-detail-group-chevron-expanded'}`}
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {group.icon}
                    <span className="cycle-detail-group-label">{group.label}</span>
                    <span className="cycle-detail-group-count">({group.issues.length})</span>
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="cycle-detail-group-items" data-testid={`cycle-issue-group-items-${group.key}`}>
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
          })
        )}
      </div>
    </div>
  );
}
