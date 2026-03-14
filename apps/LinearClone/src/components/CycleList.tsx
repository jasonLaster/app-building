import type { CycleSummary } from '../slices/cyclesSlice';
import './CycleList.css';

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

interface CycleListProps {
  cycles: CycleSummary[];
  loading: boolean;
  selectedCycleId: string | null;
  onSelectCycle: (cycleId: string) => void;
}

export default function CycleList({ cycles, loading, selectedCycleId, onSelectCycle }: CycleListProps) {
  if (loading) {
    return (
      <div className="cycle-list-loading" data-testid="cycle-list-loading">
        Loading...
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="cycle-list-empty" data-testid="cycle-list-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <p>No cycles yet. Create your first cycle to get started.</p>
      </div>
    );
  }

  return (
    <div className="cycle-list" data-testid="cycle-list">
      {cycles.map((cycle) => {
        const percentage = cycle.issueCount > 0
          ? Math.round((cycle.doneCount / cycle.issueCount) * 100)
          : 0;
        const isSelected = selectedCycleId === cycle.id;

        return (
          <button
            key={cycle.id}
            className={`cycle-list-row ${cycle.isActive ? 'cycle-list-row-active' : ''} ${isSelected ? 'cycle-list-row-selected' : ''}`}
            onClick={() => onSelectCycle(cycle.id)}
            data-testid={`cycle-row-${cycle.id}`}
          >
            <div className="cycle-list-row-left">
              <div className="cycle-list-row-header">
                <svg className="cycle-list-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span className="cycle-list-name" data-testid={`cycle-name-${cycle.id}`}>{cycle.name}</span>
                {cycle.isActive && (
                  <span className="cycle-list-active-badge" data-testid={`cycle-active-badge-${cycle.id}`}>Active</span>
                )}
              </div>
              <div className="cycle-list-meta">
                <span className="cycle-list-dates" data-testid={`cycle-dates-${cycle.id}`}>
                  {formatDateRange(cycle.startDate, cycle.endDate)}
                </span>
                <span className="cycle-list-issue-count" data-testid={`cycle-issue-count-${cycle.id}`}>
                  {cycle.issueCount} {cycle.issueCount === 1 ? 'issue' : 'issues'}
                </span>
              </div>
            </div>
            <div className="cycle-list-row-right">
              <div className="cycle-list-progress-wrapper">
                <div className="cycle-list-progress-bar" data-testid={`cycle-progress-${cycle.id}`}>
                  <div
                    className="cycle-list-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="cycle-list-progress-text">{percentage}%</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
