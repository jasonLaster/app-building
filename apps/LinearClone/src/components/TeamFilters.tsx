import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { STATUS_ORDER, STATUS_CONFIG, StatusIcon, PriorityIcon } from './IssueRow';
import './TeamFilters.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No Priority',
};

interface TeamFiltersProps {
  selectedStatuses: string[];
  selectedPriorities: string[];
  selectedAssignees: string[];
  selectedLabels: string[];
  selectedProjects: string[];
  selectedCycles: string[];
  onStatusChange: (v: string[]) => void;
  onPriorityChange: (v: string[]) => void;
  onAssigneeChange: (v: string[]) => void;
  onLabelChange: (v: string[]) => void;
  onProjectChange: (v: string[]) => void;
  onCycleChange: (v: string[]) => void;
}

type DropdownType = 'status' | 'priority' | 'assignee' | 'label' | 'project' | 'cycle' | null;

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TeamFilters({
  selectedStatuses,
  selectedPriorities,
  selectedAssignees,
  selectedLabels,
  selectedProjects,
  selectedCycles,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onLabelChange,
  onProjectChange,
  onCycleChange,
}: TeamFiltersProps) {
  const { members, projects, cycles } = useSelector((state: RootState) => state.teamIssues);
  const { items: labels } = useSelector((state: RootState) => state.labels);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  }

  return (
    <div className="team-filters" data-testid="team-filters-toolbar">
      {openDropdown && <div className="dropdown-mask" onClick={() => setOpenDropdown(null)} />}
      {/* Status Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedStatuses.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('status')}
          data-testid="team-filter-btn-status"
        >
          Status
          {selectedStatuses.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-status">{selectedStatuses.length}</span>
          )}
        </button>
        {openDropdown === 'status' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-status">
            {STATUS_ORDER.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const checked = selectedStatuses.includes(s);
              return (
                <button
                  key={s}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedStatuses, s, onStatusChange)}
                  data-testid={`team-filter-option-status-${s}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <StatusIcon status={s} color={cfg.color} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedPriorities.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('priority')}
          data-testid="team-filter-btn-priority"
        >
          Priority
          {selectedPriorities.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-priority">{selectedPriorities.length}</span>
          )}
        </button>
        {openDropdown === 'priority' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-priority">
            {PRIORITY_ORDER.map((p) => {
              const checked = selectedPriorities.includes(p);
              return (
                <button
                  key={p}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedPriorities, p, onPriorityChange)}
                  data-testid={`team-filter-option-priority-${p}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <PriorityIcon priority={p} />
                  <span>{PRIORITY_LABELS[p]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignee Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedAssignees.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('assignee')}
          data-testid="team-filter-btn-assignee"
        >
          Assignee
          {selectedAssignees.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-assignee">{selectedAssignees.length}</span>
          )}
        </button>
        {openDropdown === 'assignee' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-assignee">
            <button
              className={`team-filters-option ${selectedAssignees.includes('unassigned') ? 'team-filters-option-checked' : ''}`}
              onClick={() => toggleItem(selectedAssignees, 'unassigned', onAssigneeChange)}
              data-testid="team-filter-option-assignee-unassigned"
            >
              <span className="team-filters-checkbox">
                {selectedAssignees.includes('unassigned') && <CheckIcon />}
              </span>
              <span className="team-filters-avatar team-filters-avatar-empty">?</span>
              <span>Unassigned</span>
            </button>
            {members.map((m) => {
              const checked = selectedAssignees.includes(m.id);
              return (
                <button
                  key={m.id}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedAssignees, m.id, onAssigneeChange)}
                  data-testid={`team-filter-option-assignee-${m.id}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span className="team-filters-avatar">
                    {m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Label Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedLabels.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('label')}
          data-testid="team-filter-btn-label"
        >
          Label
          {selectedLabels.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-label">{selectedLabels.length}</span>
          )}
        </button>
        {openDropdown === 'label' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-label">
            {labels.map((label) => {
              const checked = selectedLabels.includes(label.id);
              return (
                <button
                  key={label.id}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedLabels, label.id, onLabelChange)}
                  data-testid={`team-filter-option-label-${label.id}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span className="team-filters-label-dot" style={{ backgroundColor: label.color }} />
                  <span>{label.name}</span>
                </button>
              );
            })}
            {labels.length === 0 && (
              <div className="team-filters-empty">No labels available</div>
            )}
          </div>
        )}
      </div>

      {/* Project Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedProjects.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('project')}
          data-testid="team-filter-btn-project"
        >
          Project
          {selectedProjects.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-project">{selectedProjects.length}</span>
          )}
        </button>
        {openDropdown === 'project' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-project">
            <button
              className={`team-filters-option ${selectedProjects.includes('none') ? 'team-filters-option-checked' : ''}`}
              onClick={() => toggleItem(selectedProjects, 'none', onProjectChange)}
              data-testid="team-filter-option-project-none"
            >
              <span className="team-filters-checkbox">
                {selectedProjects.includes('none') && <CheckIcon />}
              </span>
              <span>No Project</span>
            </button>
            {projects.map((p) => {
              const checked = selectedProjects.includes(p.id);
              return (
                <button
                  key={p.id}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedProjects, p.id, onProjectChange)}
                  data-testid={`team-filter-option-project-${p.id}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cycle Filter */}
      <div className="team-filters-filter">
        <button
          className={`team-filters-btn ${selectedCycles.length > 0 ? 'team-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('cycle')}
          data-testid="team-filter-btn-cycle"
        >
          Cycle
          {selectedCycles.length > 0 && (
            <span className="team-filters-badge" data-testid="team-filter-badge-cycle">{selectedCycles.length}</span>
          )}
        </button>
        {openDropdown === 'cycle' && (
          <div className="team-filters-dropdown" data-testid="team-filter-dropdown-cycle">
            <button
              className={`team-filters-option ${selectedCycles.includes('none') ? 'team-filters-option-checked' : ''}`}
              onClick={() => toggleItem(selectedCycles, 'none', onCycleChange)}
              data-testid="team-filter-option-cycle-none"
            >
              <span className="team-filters-checkbox">
                {selectedCycles.includes('none') && <CheckIcon />}
              </span>
              <span>No Cycle</span>
            </button>
            {cycles.map((c) => {
              const checked = selectedCycles.includes(c.id);
              return (
                <button
                  key={c.id}
                  className={`team-filters-option ${checked ? 'team-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedCycles, c.id, onCycleChange)}
                  data-testid={`team-filter-option-cycle-${c.id}`}
                >
                  <span className="team-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
