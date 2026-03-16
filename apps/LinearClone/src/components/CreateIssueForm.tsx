import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { StatusIcon, PriorityIcon, STATUS_CONFIG, STATUS_ORDER } from './IssueRow';
import './CreateIssueForm.css';

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'] as const;
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No Priority',
};

interface SearchableIssue {
  id: string;
  title: string;
  identifier: string;
}

export interface CreateIssueFormData {
  teamId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  labelIds: string[];
  projectId: string | null;
  cycleId: string | null;
  dueDate: string | null;
  parentId: string | null;
}

interface CreateIssueFormProps {
  defaultTeamId?: string;
  formData: CreateIssueFormData;
  onFormChange: (data: CreateIssueFormData) => void;
  titleError: string | null;
}

type DropdownType = 'team' | 'status' | 'priority' | 'assignee' | 'labels' | 'project' | 'cycle' | 'parent' | null;

export default function CreateIssueForm({ defaultTeamId, formData, onFormChange, titleError }: CreateIssueFormProps) {
  const { items: teams } = useSelector((state: RootState) => state.teams);
  const { items: labels } = useSelector((state: RootState) => state.labels);
  const token = useSelector((state: RootState) => state.auth.token);

  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const [parentResults, setParentResults] = useState<SearchableIssue[]>([]);

  // Team-specific data (members, projects, cycles)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [teamProjects, setTeamProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [teamCycles, setTeamCycles] = useState<Array<{ id: string; name: string; start_date: string; end_date: string }>>([]);

  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Set default team
  useEffect(() => {
    if (defaultTeamId && !formData.teamId) {
      onFormChange({ ...formData, teamId: defaultTeamId });
    } else if (!formData.teamId && teams.length > 0 && teams[0]) {
      onFormChange({ ...formData, teamId: teams[0].id });
    }
  }, [defaultTeamId, teams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch team-specific data when team changes
  const fetchTeamData = useCallback(async (teamId: string) => {
    if (!token || !teamId) return;
    try {
      const response = await fetch(`/api/team-issues?teamId=${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
        setTeamProjects(data.projects || []);
        setTeamCycles(data.cycles || []);
      }
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => {
    if (formData.teamId) {
      fetchTeamData(formData.teamId);
    }
  }, [formData.teamId, fetchTeamData]);

  // Search parent issues
  useEffect(() => {
    if (!token || openDropdown !== 'parent') return;
    const controller = new AbortController();
    const fetchParents = async () => {
      try {
        const params = new URLSearchParams();
        if (parentSearch) params.set('q', parentSearch);
        if (formData.teamId) params.set('teamId', formData.teamId);
        const response = await fetch(`/api/search-issues?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          setParentResults(data.issues || []);
        }
      } catch {
        // ignore abort errors
      }
    };
    const timer = setTimeout(fetchParents, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [parentSearch, formData.teamId, token, openDropdown]);

  // Close dropdown on outside click or click on non-dropdown form elements
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Close if click is outside the form entirely
      if (formRef.current && !formRef.current.contains(target)) {
        setOpenDropdown(null);
        return;
      }
      // Close if click is inside the form but outside any dropdown wrapper
      if (!target.closest('.cif-dropdown-wrapper')) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  function updateField<K extends keyof CreateIssueFormData>(key: K, value: CreateIssueFormData[K]) {
    onFormChange({ ...formData, [key]: value });
  }

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
    if (type === 'assignee') setAssigneeSearch('');
    if (type === 'project') setProjectSearch('');
    if (type === 'parent') setParentSearch('');
  }

  function handleTeamChange(teamId: string) {
    onFormChange({ ...formData, teamId, cycleId: null });
    setOpenDropdown(null);
  }

  function handleLabelToggle(labelId: string) {
    const current = formData.labelIds;
    if (current.includes(labelId)) {
      updateField('labelIds', current.filter((id) => id !== labelId));
    } else {
      updateField('labelIds', [...current, labelId]);
    }
  }

  function handleRemoveLabel(labelId: string) {
    updateField('labelIds', formData.labelIds.filter((id) => id !== labelId));
  }

  const selectedTeam = teams.find((t) => t.id === formData.teamId);
  const selectedAssignee = teamMembers.find((m) => m.id === formData.assigneeId);
  const selectedProject = teamProjects.find((p) => p.id === formData.projectId);
  const selectedCycle = teamCycles.find((c) => c.id === formData.cycleId);
  const selectedLabels = labels.filter((l) => formData.labelIds.includes(l.id));
  const selectedParent = parentResults.find((i) => i.id === formData.parentId);

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );
  const filteredProjects = teamProjects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const filteredParents = parentResults.filter((i) =>
    !parentSearch || i.title.toLowerCase().includes(parentSearch.toLowerCase()) || i.identifier.toLowerCase().includes(parentSearch.toLowerCase())
  );

  const statusConfig = STATUS_CONFIG[formData.status] || STATUS_CONFIG.backlog;

  function formatDueDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="create-issue-form" ref={formRef} data-testid="create-issue-form">
      {/* Team Selector */}
      <div className="cif-field" data-testid="create-issue-team-field">
        <label className="cif-label">Team</label>
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('team')}
            data-testid="create-issue-team-selector"
          >
            <span>{selectedTeam ? selectedTeam.name : 'Select team'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'team' && (
            <div className="cif-dropdown" data-testid="create-issue-team-dropdown">
              {teams.map((team) => (
                <button
                  key={team.id}
                  className={`cif-dropdown-option ${formData.teamId === team.id ? 'cif-dropdown-option-active' : ''}`}
                  onClick={() => handleTeamChange(team.id)}
                  data-testid={`create-issue-team-option-${team.id}`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="cif-field" data-testid="create-issue-title-field">
        <label className="cif-label">Title</label>
        <input
          ref={titleRef}
          type="text"
          className={`cif-input ${titleError ? 'cif-input-error' : ''}`}
          placeholder="Issue title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          data-testid="create-issue-title-input"
        />
        {titleError && (
          <span className="cif-error" data-testid="create-issue-title-error">{titleError}</span>
        )}
      </div>

      {/* Description */}
      <div className="cif-field" data-testid="create-issue-description-field">
        <label className="cif-label">Description</label>
        <textarea
          className="cif-textarea"
          placeholder="Add description... (supports markdown)"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          data-testid="create-issue-description-input"
        />
      </div>

      {/* Status & Priority row */}
      <div className="cif-row">
        {/* Status */}
        <div className="cif-field cif-field-half" data-testid="create-issue-status-field">
          <label className="cif-label">Status</label>
          <div className="cif-dropdown-wrapper">
            <button
              className="cif-select-btn"
              onClick={() => toggleDropdown('status')}
              data-testid="create-issue-status-selector"
            >
              <StatusIcon status={formData.status} color={statusConfig.color} />
              <span>{statusConfig.label}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {openDropdown === 'status' && (
              <div className="cif-dropdown" data-testid="create-issue-status-dropdown">
                {STATUS_ORDER.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      className={`cif-dropdown-option ${formData.status === s ? 'cif-dropdown-option-active' : ''}`}
                      onClick={() => { updateField('status', s); setOpenDropdown(null); }}
                      data-testid={`create-issue-status-option-${s}`}
                    >
                      <StatusIcon status={s} color={cfg.color} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="cif-field cif-field-half" data-testid="create-issue-priority-field">
          <label className="cif-label">Priority</label>
          <div className="cif-dropdown-wrapper">
            <button
              className="cif-select-btn"
              onClick={() => toggleDropdown('priority')}
              data-testid="create-issue-priority-selector"
            >
              <PriorityIcon priority={formData.priority} />
              <span>{PRIORITY_LABELS[formData.priority] || 'No Priority'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {openDropdown === 'priority' && (
              <div className="cif-dropdown" data-testid="create-issue-priority-dropdown">
                {PRIORITY_ORDER.map((p) => (
                  <button
                    key={p}
                    className={`cif-dropdown-option ${formData.priority === p ? 'cif-dropdown-option-active' : ''}`}
                    onClick={() => { updateField('priority', p); setOpenDropdown(null); }}
                    data-testid={`create-issue-priority-option-${p}`}
                  >
                    <PriorityIcon priority={p} />
                    <span>{PRIORITY_LABELS[p]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignee */}
      <div className="cif-field" data-testid="create-issue-assignee-field">
        <label className="cif-label">Assignee</label>
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('assignee')}
            data-testid="create-issue-assignee-selector"
          >
            {selectedAssignee ? (
              <>
                <span className="cif-avatar">{selectedAssignee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                <span>{selectedAssignee.name}</span>
              </>
            ) : (
              <span className="cif-placeholder">No assignee</span>
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'assignee' && (
            <div className="cif-dropdown cif-dropdown-searchable" data-testid="create-issue-assignee-dropdown">
              <input
                className="cif-search-input"
                placeholder="Search members..."
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                autoFocus
                data-testid="create-issue-assignee-search"
              />
              <button
                className="cif-dropdown-option"
                onClick={() => { updateField('assigneeId', null); setOpenDropdown(null); }}
                data-testid="create-issue-assignee-option-none"
              >
                <span className="cif-avatar cif-avatar-empty">?</span>
                <span>No assignee</span>
              </button>
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  className={`cif-dropdown-option ${formData.assigneeId === m.id ? 'cif-dropdown-option-active' : ''}`}
                  onClick={() => { updateField('assigneeId', m.id); setOpenDropdown(null); }}
                  data-testid={`create-issue-assignee-option-${m.id}`}
                >
                  <span className="cif-avatar">{m.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="cif-field" data-testid="create-issue-labels-field">
        <label className="cif-label">Labels</label>
        {selectedLabels.length > 0 && (
          <div className="cif-selected-labels" data-testid="create-issue-selected-labels">
            {selectedLabels.map((label) => (
              <span key={label.id} className="cif-label-badge" style={{ borderColor: label.color }} data-testid={`create-issue-label-badge-${label.id}`}>
                <span className="cif-label-dot" style={{ backgroundColor: label.color }} />
                {label.name}
                <button
                  className="cif-label-remove"
                  onClick={() => handleRemoveLabel(label.id)}
                  data-testid={`create-issue-label-remove-${label.id}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('labels')}
            data-testid="create-issue-labels-selector"
          >
            <span className="cif-placeholder">{selectedLabels.length === 0 ? 'Select labels' : 'Add more labels'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'labels' && (
            <div className="cif-dropdown" data-testid="create-issue-labels-dropdown">
              {labels.map((label) => (
                <button
                  key={label.id}
                  className={`cif-dropdown-option ${formData.labelIds.includes(label.id) ? 'cif-dropdown-option-active' : ''}`}
                  onClick={() => handleLabelToggle(label.id)}
                  data-testid={`create-issue-label-option-${label.id}`}
                >
                  <span className="cif-label-dot" style={{ backgroundColor: label.color }} />
                  <span>{label.name}</span>
                  {formData.labelIds.includes(label.id) && (
                    <svg className="cif-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
              {labels.length === 0 && (
                <div className="cif-dropdown-empty">No labels available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project */}
      <div className="cif-field" data-testid="create-issue-project-field">
        <label className="cif-label">Project</label>
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('project')}
            data-testid="create-issue-project-selector"
          >
            <span className={selectedProject ? '' : 'cif-placeholder'}>
              {selectedProject ? selectedProject.name : 'No project'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'project' && (
            <div className="cif-dropdown cif-dropdown-searchable" data-testid="create-issue-project-dropdown">
              <input
                className="cif-search-input"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                autoFocus
                data-testid="create-issue-project-search"
              />
              <button
                className="cif-dropdown-option"
                onClick={() => { updateField('projectId', null); setOpenDropdown(null); }}
                data-testid="create-issue-project-option-none"
              >
                <span>No project</span>
              </button>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  className={`cif-dropdown-option ${formData.projectId === p.id ? 'cif-dropdown-option-active' : ''}`}
                  onClick={() => { updateField('projectId', p.id); setOpenDropdown(null); }}
                  data-testid={`create-issue-project-option-${p.id}`}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cycle */}
      <div className="cif-field" data-testid="create-issue-cycle-field">
        <label className="cif-label">Cycle</label>
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('cycle')}
            data-testid="create-issue-cycle-selector"
          >
            <span className={selectedCycle ? '' : 'cif-placeholder'}>
              {selectedCycle ? selectedCycle.name : 'No cycle'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'cycle' && (
            <div className="cif-dropdown" data-testid="create-issue-cycle-dropdown">
              <button
                className="cif-dropdown-option"
                onClick={() => { updateField('cycleId', null); setOpenDropdown(null); }}
                data-testid="create-issue-cycle-option-none"
              >
                <span>No cycle</span>
              </button>
              {teamCycles.map((c) => {
                const now = new Date();
                const start = new Date(c.start_date);
                const end = new Date(c.end_date);
                const isActive = now >= start && now <= end;
                return (
                  <button
                    key={c.id}
                    className={`cif-dropdown-option ${formData.cycleId === c.id ? 'cif-dropdown-option-active' : ''}`}
                    onClick={() => { updateField('cycleId', c.id); setOpenDropdown(null); }}
                    data-testid={`create-issue-cycle-option-${c.id}`}
                  >
                    <span>{c.name}</span>
                    {isActive && <span className="cif-active-badge">Active</span>}
                  </button>
                );
              })}
              {teamCycles.length === 0 && (
                <div className="cif-dropdown-empty">No cycles available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="cif-field" data-testid="create-issue-due-date-field">
        <label className="cif-label">Due date</label>
        <div className="cif-date-wrapper">
          <input
            type="date"
            className="cif-date-input"
            value={formData.dueDate || ''}
            onChange={(e) => updateField('dueDate', e.target.value || null)}
            data-testid="create-issue-due-date-input"
          />
          {formData.dueDate && (
            <div className="cif-date-display">
              <span data-testid="create-issue-due-date-display">{formatDueDisplay(formData.dueDate)}</span>
              <button
                className="cif-date-clear"
                onClick={() => updateField('dueDate', null)}
                data-testid="create-issue-due-date-clear"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Parent Issue */}
      <div className="cif-field" data-testid="create-issue-parent-field">
        <label className="cif-label">Parent issue</label>
        <div className="cif-dropdown-wrapper">
          <button
            className="cif-select-btn"
            onClick={() => toggleDropdown('parent')}
            data-testid="create-issue-parent-selector"
          >
            <span className={selectedParent || formData.parentId ? '' : 'cif-placeholder'}>
              {selectedParent ? `${selectedParent.identifier}: ${selectedParent.title}` : formData.parentId ? 'Loading...' : 'No parent issue'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openDropdown === 'parent' && (
            <div className="cif-dropdown cif-dropdown-searchable" data-testid="create-issue-parent-dropdown">
              <input
                className="cif-search-input"
                placeholder="Search issues..."
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                autoFocus
                data-testid="create-issue-parent-search"
              />
              <button
                className="cif-dropdown-option"
                onClick={() => { updateField('parentId', null); setOpenDropdown(null); }}
                data-testid="create-issue-parent-option-none"
              >
                <span>No parent issue</span>
              </button>
              {filteredParents.map((issue) => (
                <button
                  key={issue.id}
                  className={`cif-dropdown-option ${formData.parentId === issue.id ? 'cif-dropdown-option-active' : ''}`}
                  onClick={() => { updateField('parentId', issue.id); setOpenDropdown(null); }}
                  data-testid={`create-issue-parent-option-${issue.id}`}
                >
                  <span className="cif-parent-identifier">{issue.identifier}</span>
                  <span>{issue.title}</span>
                </button>
              ))}
              {filteredParents.length === 0 && parentSearch && (
                <div className="cif-dropdown-empty">No issues found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
