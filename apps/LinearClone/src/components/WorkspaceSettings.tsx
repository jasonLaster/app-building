import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateWorkspace, fetchWorkspace } from '../slices/workspaceSlice';
import { fetchTeams } from '../slices/teamsSlice';
import './WorkspaceSettings.css';

export default function WorkspaceSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { items: teams } = useSelector((state: RootState) => state.teams);
  const { token } = useSelector((state: RootState) => state.auth);

  const [nameValue, setNameValue] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchTeams());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (workspace) {
      setNameValue(workspace.name);
      setSelectedTeamId(workspace.default_team_id);
    }
  }, [workspace]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTeamDropdownOpen(false);
      }
    }
    if (teamDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [teamDropdownOpen]);

  function clearSuccess() {
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  async function handleSave() {
    if (!nameValue.trim()) {
      setNameError('Workspace name is required');
      nameInputRef.current?.focus();
      return;
    }
    setNameError(null);
    setSaving(true);

    const updates: { name?: string; default_team_id?: string | null } = {};
    if (nameValue.trim() !== workspace?.name) {
      updates.name = nameValue.trim();
    }
    if (selectedTeamId !== workspace?.default_team_id) {
      updates.default_team_id = selectedTeamId;
    }

    if (Object.keys(updates).length === 0) {
      setSaving(false);
      setSuccessMessage('Settings saved');
      clearSuccess();
      return;
    }

    const result = await dispatch(updateWorkspace(updates));
    setSaving(false);

    if (updateWorkspace.rejected.match(result)) {
      setNameError(result.payload as string);
      return;
    }

    setSuccessMessage('Settings saved');
    clearSuccess();
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  function handleTeamSelect(teamId: string | null) {
    setSelectedTeamId(teamId);
    setTeamDropdownOpen(false);
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const hasChanges =
    nameValue.trim() !== (workspace?.name || '') ||
    selectedTeamId !== (workspace?.default_team_id ?? null);

  return (
    <div className="ws-settings" data-testid="workspace-settings">
      <div className="ws-fields">
        {/* Workspace Name */}
        <div className="ws-field" data-testid="workspace-name-field">
          <label className="ws-field-label">Workspace name</label>
          <input
            ref={nameInputRef}
            type="text"
            className={`ws-input ${nameError ? 'ws-input-error' : ''}`}
            value={nameValue}
            onChange={(e) => { setNameValue(e.target.value); setNameError(null); }}
            onKeyDown={handleNameKeyDown}
            data-testid="workspace-name-input"
          />
          {nameError && (
            <span className="ws-field-error" data-testid="workspace-name-error">{nameError}</span>
          )}
        </div>

        {/* Default Team */}
        <div className="ws-field" data-testid="workspace-default-team-field">
          <label className="ws-field-label">Default team for new issues</label>
          <div className="ws-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="ws-select-btn"
              onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
              data-testid="workspace-default-team-selector"
            >
              <span>{selectedTeam ? selectedTeam.name : 'No default team'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {teamDropdownOpen && (
              <div className="ws-dropdown" data-testid="workspace-default-team-dropdown">
                <button
                  className={`ws-dropdown-option ${!selectedTeamId ? 'ws-dropdown-option-active' : ''}`}
                  onClick={() => handleTeamSelect(null)}
                  data-testid="workspace-default-team-option-none"
                >
                  No default team
                </button>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    className={`ws-dropdown-option ${selectedTeamId === team.id ? 'ws-dropdown-option-active' : ''}`}
                    onClick={() => handleTeamSelect(team.id)}
                    data-testid={`workspace-default-team-option-${team.id}`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ws-actions">
        <button
          className="ws-save-btn"
          onClick={handleSave}
          disabled={saving}
          data-testid="workspace-settings-save-btn"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {successMessage && (
          <span className="ws-success" data-testid="workspace-settings-success">{successMessage}</span>
        )}
      </div>
    </div>
  );
}
