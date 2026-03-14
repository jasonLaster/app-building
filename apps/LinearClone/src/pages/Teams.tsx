import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTeams, createTeam } from '../slices/teamsSlice';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import type { CreateTeamFormData } from '../components/CreateTeamModal';
import TeamSettings from '../components/TeamSettings';
import './Teams.css';

export default function Teams() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: teams, loading } = useSelector((state: RootState) => state.teams);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchTeams());
    }
  }, [dispatch, token]);

  async function handleCreateTeam(data: CreateTeamFormData) {
    const result = await dispatch(createTeam({
      name: data.name,
      identifier: data.identifier,
      description: data.description,
    }));
    if (createTeam.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    setCreateModalOpen(false);
  }

  if (selectedTeamId) {
    return (
      <div className="teams-page" data-testid="teams-page">
        <TeamSettings
          teamId={selectedTeamId}
          onBack={() => {
            setSelectedTeamId(null);
            dispatch(fetchTeams());
          }}
        />
      </div>
    );
  }

  return (
    <div className="teams-page" data-testid="teams-page">
      <div className="teams-header">
        <h1 className="teams-title" data-testid="teams-title">Teams</h1>
        <button
          className="teams-create-btn"
          onClick={() => setCreateModalOpen(true)}
          data-testid="create-team-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Team
        </button>
      </div>

      {loading ? (
        <div className="teams-loading" data-testid="teams-loading">
          Loading...
        </div>
      ) : teams.length === 0 ? (
        <div className="teams-empty" data-testid="teams-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>No teams yet. Create your first team to get started.</p>
        </div>
      ) : (
        <div className="teams-grid" data-testid="teams-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={(id) => setSelectedTeamId(id)}
            />
          ))}
        </div>
      )}

      <CreateTeamModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTeam}
      />
    </div>
  );
}
