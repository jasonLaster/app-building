import type { Team } from '../slices/teamsSlice';
import './TeamCard.css';

interface TeamCardProps {
  team: Team;
  onClick: (teamId: string) => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <div
      className="team-card"
      onClick={() => onClick(team.id)}
      data-testid={`team-card-${team.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(team.id); }}
    >
      <div className="team-card-header">
        <span className="team-card-identifier-badge" data-testid={`team-card-prefix-${team.id}`}>
          {team.identifier}
        </span>
        <h3 className="team-card-name" data-testid={`team-card-name-${team.id}`}>
          {team.name}
        </h3>
      </div>

      <div className="team-card-meta">
        <div className="team-card-stat" data-testid={`team-card-members-${team.id}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{team.member_count} {team.member_count === 1 ? 'member' : 'members'}</span>
        </div>

        <div className="team-card-stat" data-testid={`team-card-cycle-${team.id}`}>
          {team.active_cycle_name ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>{team.active_cycle_name}</span>
            </>
          ) : (
            <span className="team-card-no-cycle">No active cycle</span>
          )}
        </div>
      </div>
    </div>
  );
}
