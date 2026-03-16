import { useState } from 'react';
import type { ProjectMember, ProjectTeamFilter } from '../slices/projectsSlice';
import './ProjectFilters.css';

const PROJECT_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface ProjectFiltersProps {
  selectedStatuses: string[];
  selectedLeads: string[];
  selectedTeams: string[];
  onStatusChange: (v: string[]) => void;
  onLeadChange: (v: string[]) => void;
  onTeamChange: (v: string[]) => void;
  members: ProjectMember[];
  teams: ProjectTeamFilter[];
}

type DropdownType = 'status' | 'lead' | 'team' | null;

export default function ProjectFilters({
  selectedStatuses,
  selectedLeads,
  selectedTeams,
  onStatusChange,
  onLeadChange,
  onTeamChange,
  members,
  teams,
}: ProjectFiltersProps) {
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
    <div className="project-filters" data-testid="project-filters-toolbar">
      {openDropdown && <div className="dropdown-mask" onClick={() => setOpenDropdown(null)} />}
      {/* Status Filter */}
      <div className="project-filters-filter">
        <button
          className={`project-filters-btn ${selectedStatuses.length > 0 ? 'project-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('status')}
          data-testid="project-filter-btn-status"
        >
          Status
          {selectedStatuses.length > 0 && (
            <span className="project-filters-badge" data-testid="project-filter-badge-status">{selectedStatuses.length}</span>
          )}
        </button>
        {openDropdown === 'status' && (
          <div className="project-filters-dropdown" data-testid="project-filter-dropdown-status">
            {PROJECT_STATUSES.map((s) => {
              const checked = selectedStatuses.includes(s.value);
              return (
                <button
                  key={s.value}
                  className={`project-filters-option ${checked ? 'project-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedStatuses, s.value, onStatusChange)}
                  data-testid={`project-filter-option-status-${s.value}`}
                >
                  <span className="project-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead Filter */}
      <div className="project-filters-filter">
        <button
          className={`project-filters-btn ${selectedLeads.length > 0 ? 'project-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('lead')}
          data-testid="project-filter-btn-lead"
        >
          Lead
          {selectedLeads.length > 0 && (
            <span className="project-filters-badge" data-testid="project-filter-badge-lead">{selectedLeads.length}</span>
          )}
        </button>
        {openDropdown === 'lead' && (
          <div className="project-filters-dropdown" data-testid="project-filter-dropdown-lead">
            {members.map((m) => {
              const checked = selectedLeads.includes(m.id);
              return (
                <button
                  key={m.id}
                  className={`project-filters-option ${checked ? 'project-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedLeads, m.id, onLeadChange)}
                  data-testid={`project-filter-option-lead-${m.id}`}
                >
                  <span className="project-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span className="project-filters-avatar">
                    {getInitials(m.name)}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
            {members.length === 0 && (
              <div className="project-filters-empty">No members available</div>
            )}
          </div>
        )}
      </div>

      {/* Team Filter */}
      <div className="project-filters-filter">
        <button
          className={`project-filters-btn ${selectedTeams.length > 0 ? 'project-filters-btn-active' : ''}`}
          onClick={() => toggleDropdown('team')}
          data-testid="project-filter-btn-team"
        >
          Team
          {selectedTeams.length > 0 && (
            <span className="project-filters-badge" data-testid="project-filter-badge-team">{selectedTeams.length}</span>
          )}
        </button>
        {openDropdown === 'team' && (
          <div className="project-filters-dropdown" data-testid="project-filter-dropdown-team">
            {teams.map((t) => {
              const checked = selectedTeams.includes(t.id);
              return (
                <button
                  key={t.id}
                  className={`project-filters-option ${checked ? 'project-filters-option-checked' : ''}`}
                  onClick={() => toggleItem(selectedTeams, t.id, onTeamChange)}
                  data-testid={`project-filter-option-team-${t.id}`}
                >
                  <span className="project-filters-checkbox">{checked && <CheckIcon />}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
            {teams.length === 0 && (
              <div className="project-filters-empty">No teams available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
