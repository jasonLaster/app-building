import type { BurndownEntry } from '../slices/cyclesSlice';
import './BurndownChart.css';

interface BurndownChartProps {
  burndown: BurndownEntry[];
  startDate: string;
  endDate: string;
}

function getAllDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BurndownChart({ burndown, startDate, endDate }: BurndownChartProps) {
  const allDates = getAllDates(startDate, endDate);
  const burndownMap: Record<string, number> = {};
  for (const entry of burndown) {
    burndownMap[entry.date] = entry.count;
  }

  const data = allDates.map((date) => ({
    date,
    count: burndownMap[date] || 0,
  }));

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const showEveryNthLabel = allDates.length > 14 ? Math.ceil(allDates.length / 14) : 1;
  const hasCompletions = burndown.length > 0;

  return (
    <div className="burndown-chart" data-testid="burndown-chart">
      <h3 className="burndown-chart-title" data-testid="burndown-chart-title">Issues Completed per Day</h3>
      {!hasCompletions ? (
        <div className="burndown-chart-empty" data-testid="burndown-chart-empty">
          <p>No issues completed yet</p>
        </div>
      ) : null}
      <div className="burndown-chart-container" data-testid="burndown-chart-container">
        <div className="burndown-chart-y-axis">
          {Array.from({ length: maxCount + 1 }, (_, i) => maxCount - i).map((val) => (
            <span key={val} className="burndown-chart-y-label">{val}</span>
          ))}
        </div>
        <div className="burndown-chart-bars-wrapper">
          <div className="burndown-chart-bars">
            {data.map((d, i) => (
              <div
                key={d.date}
                className="burndown-chart-bar-column"
                data-testid={`burndown-bar-${d.date}`}
              >
                <div className="burndown-chart-bar-track">
                  <div
                    className="burndown-chart-bar"
                    style={{ height: `${(d.count / maxCount) * 100}%` }}
                    title={`${formatDateLabel(d.date)}: ${d.count} issue${d.count !== 1 ? 's' : ''}`}
                  />
                </div>
                {i % showEveryNthLabel === 0 && (
                  <span className="burndown-chart-x-label">{formatDateLabel(d.date)}</span>
                )}
                {i % showEveryNthLabel !== 0 && (
                  <span className="burndown-chart-x-label burndown-chart-x-label-hidden">&nbsp;</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
