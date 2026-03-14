import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchTeamDetail,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  clearTeamDetail,
  fetchTeams,
} from '../slices/teamsSlice';
import './TeamSettings.css';

interface TeamSettingsProps {
  teamId: string;
  onBack: () => void;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function TeamSettings({ teamId, onBack }: TeamSettingsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTeam, teamMembers, availableMembers, detailLoading } = useSelector(
    (state: RootState) => state.teams
  );

  const [editingName, setEditingName] = useState(false);
  const [editingIdentifier, setEditingIdentifier] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [identifierValue, setIdentifierValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    dispatch(fetchTeamDetail(teamId));
    return () => {
      dispatch(clearTeamDetail());
    };
  }, [dispatch, teamId]);

  useEffect(() => {
    if (selectedTeam) {
      setNameValue(selectedTeam.name);
      setIdentifierValue(selectedTeam.identifier);
      setDescriptionValue(selectedTeam.description);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingIdentifier) {
      identifierInputRef.current?.focus();
      identifierInputRef.current?.select();
    }
  }, [editingIdentifier]);

  useEffect(() => {
    if (editingDescription) {
      descriptionInputRef.current?.focus();
    }
  }, [editingDescription]);

  async function saveNameField() {
    if (!nameValue.trim()) {
      setNameError('Team name cannot be empty');
      return;
    }
    setNameError(null);
    if (nameValue.trim() !== selectedTeam?.name) {
      const result = await dispatch(updateTeam({ teamId, name: nameValue.trim() }));
      if (updateTeam.rejected.match(result)) {
        setNameError(result.payload as string);
        return;
      }
      dispatch(fetchTeams());
    }
    setEditingName(false);
  }

  async function saveIdentifierField() {
    const upper = identifierValue.toUpperCase();
    if (upper.length < 2 || upper.length > 5) {
      setIdentifierError('Identifier prefix must be 2-5 uppercase characters');
      return;
    }
    setIdentifierError(null);
    if (upper !== selectedTeam?.identifier) {
      const result = await dispatch(updateTeam({ teamId, identifier: upper }));
      if (updateTeam.rejected.match(result)) {
        setIdentifierError(result.payload as string);
        return;
      }
      dispatch(fetchTeams());
    }
    setEditingIdentifier(false);
  }

  async function saveDescriptionField() {
    if (descriptionValue !== selectedTeam?.description) {
      await dispatch(updateTeam({ teamId, description: descriptionValue }));
      dispatch(fetchTeams());
    }
    setEditingDescription(false);
  }

  function cancelNameEdit() {
    setNameValue(selectedTeam?.name || '');
    setNameError(null);
    setEditingName(false);
  }

  function cancelIdentifierEdit() {
    setIdentifierValue(selectedTeam?.identifier || '');
    setIdentifierError(null);
    setEditingIdentifier(false);
  }

  function cancelDescriptionEdit() {
    setDescriptionValue(selectedTeam?.description || '');
    setEditingDescription(false);
  }

  async function handleDeleteTeam() {
    await dispatch(deleteTeam(teamId));
    dispatch(fetchTeams());
    onBack();
  }

  async function handleAddMember(memberIdToAdd: string) {
    await dispatch(addTeamMember({ teamId, memberIdToAdd }));
    setShowAddMember(false);
  }

  async function handleRemoveMember(memberIdToRemove: string) {
    await dispatch(removeTeamMember({ teamId, memberIdToRemove }));
    setRemovingMemberId(null);
  }

  if (detailLoading || !selectedTeam) {
    return (
      <div className="team-settings" data-testid="team-settings">
        <div className="ts-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="team-settings" data-testid="team-settings">
      <div className="ts-top-bar">
        <button
          className="ts-back-btn"
          onClick={onBack}
          data-testid="team-settings-back-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Teams
        </button>
      </div>

      <div className="ts-fields">
        {/* Team Name */}
        <div className="ts-field" data-testid="team-settings-name-field">
          <label className="ts-field-label">Team name</label>
          {editingName ? (
            <div className="ts-field-edit">
              <input
                ref={nameInputRef}
                type="text"
                className={`ts-input ${nameError ? 'ts-input-error' : ''}`}
                value={nameValue}
                onChange={(e) => { setNameValue(e.target.value); setNameError(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveNameField();
                  if (e.key === 'Escape') cancelNameEdit();
                }}
                onBlur={saveNameField}
                data-testid="team-settings-name-input"
              />
              {nameError && (
                <span className="ts-field-error" data-testid="team-settings-name-error">{nameError}</span>
              )}
            </div>
          ) : (
            <div
              className="ts-field-value ts-field-clickable"
              onClick={() => setEditingName(true)}
              data-testid="team-settings-name-value"
            >
              {selectedTeam.name}
              <svg className="ts-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          )}
        </div>

        {/* Identifier Prefix */}
        <div className="ts-field" data-testid="team-settings-identifier-field">
          <label className="ts-field-label">Identifier prefix</label>
          {editingIdentifier ? (
            <div className="ts-field-edit">
              <input
                ref={identifierInputRef}
                type="text"
                className={`ts-input ${identifierError ? 'ts-input-error' : ''}`}
                value={identifierValue}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  setIdentifierValue(upper.slice(0, 5));
                  setIdentifierError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveIdentifierField();
                  if (e.key === 'Escape') cancelIdentifierEdit();
                }}
                onBlur={saveIdentifierField}
                maxLength={5}
                data-testid="team-settings-identifier-input"
              />
              {identifierError && (
                <span className="ts-field-error" data-testid="team-settings-identifier-error">{identifierError}</span>
              )}
            </div>
          ) : (
            <div
              className="ts-field-value ts-field-clickable"
              onClick={() => setEditingIdentifier(true)}
              data-testid="team-settings-identifier-value"
            >
              {selectedTeam.identifier}
              <svg className="ts-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="ts-field" data-testid="team-settings-description-field">
          <label className="ts-field-label">Description</label>
          {editingDescription ? (
            <div className="ts-field-edit">
              <textarea
                ref={descriptionInputRef}
                className="ts-textarea"
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelDescriptionEdit();
                }}
                onBlur={saveDescriptionField}
                rows={3}
                data-testid="team-settings-description-input"
              />
            </div>
          ) : (
            <div
              className="ts-field-value ts-field-clickable"
              onClick={() => setEditingDescription(true)}
              data-testid="team-settings-description-value"
            >
              {selectedTeam.description || <span className="ts-placeholder">No description</span>}
              <svg className="ts-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="ts-members-section" data-testid="team-settings-members-section">
        <div className="ts-members-header">
          <h3 className="ts-members-title">Team Members</h3>
          <button
            className="ts-add-member-btn"
            onClick={() => setShowAddMember(!showAddMember)}
            data-testid="team-settings-add-member-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Member
          </button>
        </div>

        {showAddMember && (
          <div className="ts-add-member-dropdown" data-testid="team-settings-member-selector">
            {availableMembers.length === 0 ? (
              <div className="ts-add-member-empty">No available members to add</div>
            ) : (
              availableMembers.map((member) => (
                <button
                  key={member.id}
                  className="ts-add-member-option"
                  onClick={() => handleAddMember(member.id)}
                  data-testid={`team-settings-add-member-option-${member.id}`}
                >
                  <span className="ts-member-avatar">{getInitials(member.name)}</span>
                  <span className="ts-member-option-name">{member.name}</span>
                  <span className="ts-member-option-email">{member.email}</span>
                </button>
              ))
            )}
          </div>
        )}

        {teamMembers.length === 0 ? (
          <div className="ts-members-empty" data-testid="team-settings-members-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No members yet. Add members to this team.</p>
          </div>
        ) : (
          <div className="ts-members-list" data-testid="team-settings-members-list">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="ts-member-row"
                data-testid={`team-settings-member-${member.id}`}
              >
                <div className="ts-member-info">
                  <span className="ts-member-avatar">{getInitials(member.name)}</span>
                  <div className="ts-member-details">
                    <span className="ts-member-name">{member.name}</span>
                    <span className="ts-member-email">{member.email}</span>
                  </div>
                </div>

                {removingMemberId === member.id ? (
                  <div className="ts-member-confirm">
                    <span className="ts-confirm-text">Remove {member.name}?</span>
                    <button
                      className="ts-confirm-btn"
                      onClick={() => handleRemoveMember(member.id)}
                      data-testid={`team-settings-confirm-remove-${member.id}`}
                    >
                      Confirm
                    </button>
                    <button
                      className="ts-cancel-confirm-btn"
                      onClick={() => setRemovingMemberId(null)}
                      data-testid={`team-settings-cancel-remove-${member.id}`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="ts-remove-btn"
                    onClick={() => setRemovingMemberId(member.id)}
                    data-testid={`team-settings-remove-member-${member.id}`}
                    title={`Remove ${member.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Team */}
      <div className="ts-danger-zone" data-testid="team-settings-danger-zone">
        {showDeleteConfirm ? (
          <div className="ts-delete-confirm" data-testid="team-settings-delete-confirm">
            <p className="ts-delete-confirm-text">
              Are you sure you want to delete the team &ldquo;{selectedTeam.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="ts-delete-confirm-actions">
              <button
                className="ts-delete-confirm-btn"
                onClick={handleDeleteTeam}
                data-testid="team-settings-confirm-delete-btn"
              >
                Delete
              </button>
              <button
                className="ts-delete-cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                data-testid="team-settings-cancel-delete-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="ts-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            data-testid="team-settings-delete-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete Team
          </button>
        )}
      </div>
    </div>
  );
}
