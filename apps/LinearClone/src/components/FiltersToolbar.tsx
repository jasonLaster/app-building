import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { STATUS_ORDER, STATUS_CONFIG, PRIORITY_CONFIG, StatusIcon, PriorityIcon } from './IssueRow';
import './FiltersToolbar.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;

interface FiltersToolbarProps {
  selectedStatuses: string[];
  selectedPriorities: string[];
  selectedLabels: string[];
  onStatusChange: (statuses: string[]) => void;
  onPriorityChange: (priorities: string[]) => void;
  onLabelChange: (labels: string[]) => void;
}

type DropdownType = 'status' | 'priority' | 'label' | null;

export default function FiltersToolbar({
  selectedStatuses,
  selectedPriorities,
  selectedLabels,
  onStatusChange,
  onPriorityChange,
  onLabelChange,
}: FiltersToolbarProps) {
  const { items: labels } = useSelector((state: RootState) => state.labels);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  function toggleStatus(status: string) {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  }

  function togglePriority(priority: string) {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter((p) => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  }

  function toggleLabel(labelId: string) {
    if (selectedLabels.includes(labelId)) {
      onLabelChange(selectedLabels.filter((l) => l !== labelId));
    } else {
      onLabelChange([...selectedLabels, labelId]);
    }
  }

  return (
    <div className="filters-toolbar" data-testid="filters-toolbar">
      {openDropdown && <div className="dropdown-mask" onClick={() => setOpenDropdown(null)} />}
      <div className="filters-toolbar-filter">
        <button
          className={`filters-toolbar-btn ${selectedStatuses.length > 0 ? 'filters-toolbar-btn-active' : ''}`}
          onClick={() => toggleDropdown('status')}
          data-testid="filter-btn-status"
        >
          Status
          {selectedStatuses.length > 0 && (
            <span className="filters-toolbar-badge" data-testid="filter-badge-status">
              {selectedStatuses.length}
            </span>
          )}
        </button>
        {openDropdown === 'status' && (
          <div className="filters-toolbar-dropdown" data-testid="filter-dropdown-status">
            {STATUS_ORDER.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const checked = selectedStatuses.includes(s);
              return (
                <button
                  key={s}
                  className={`filters-toolbar-option ${checked ? 'filters-toolbar-option-checked' : ''}`}
                  onClick={() => toggleStatus(s)}
                  data-testid={`filter-option-status-${s}`}
                >
                  <span className="filters-toolbar-checkbox">
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <StatusIcon status={s} color={cfg.color} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="filters-toolbar-filter">
        <button
          className={`filters-toolbar-btn ${selectedPriorities.length > 0 ? 'filters-toolbar-btn-active' : ''}`}
          onClick={() => toggleDropdown('priority')}
          data-testid="filter-btn-priority"
        >
          Priority
          {selectedPriorities.length > 0 && (
            <span className="filters-toolbar-badge" data-testid="filter-badge-priority">
              {selectedPriorities.length}
            </span>
          )}
        </button>
        {openDropdown === 'priority' && (
          <div className="filters-toolbar-dropdown" data-testid="filter-dropdown-priority">
            {PRIORITY_ORDER.map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const checked = selectedPriorities.includes(p);
              return (
                <button
                  key={p}
                  className={`filters-toolbar-option ${checked ? 'filters-toolbar-option-checked' : ''}`}
                  onClick={() => togglePriority(p)}
                  data-testid={`filter-option-priority-${p}`}
                >
                  <span className="filters-toolbar-checkbox">
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <PriorityIcon priority={p} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="filters-toolbar-filter">
        <button
          className={`filters-toolbar-btn ${selectedLabels.length > 0 ? 'filters-toolbar-btn-active' : ''}`}
          onClick={() => toggleDropdown('label')}
          data-testid="filter-btn-label"
        >
          Label
          {selectedLabels.length > 0 && (
            <span className="filters-toolbar-badge" data-testid="filter-badge-label">
              {selectedLabels.length}
            </span>
          )}
        </button>
        {openDropdown === 'label' && (
          <div className="filters-toolbar-dropdown" data-testid="filter-dropdown-label">
            {labels.map((label) => {
              const checked = selectedLabels.includes(label.id);
              return (
                <button
                  key={label.id}
                  className={`filters-toolbar-option ${checked ? 'filters-toolbar-option-checked' : ''}`}
                  onClick={() => toggleLabel(label.id)}
                  data-testid={`filter-option-label-${label.id}`}
                >
                  <span className="filters-toolbar-checkbox">
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="filters-toolbar-label-dot" style={{ backgroundColor: label.color }} />
                  <span>{label.name}</span>
                </button>
              );
            })}
            {labels.length === 0 && (
              <div className="filters-toolbar-empty">No labels available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
