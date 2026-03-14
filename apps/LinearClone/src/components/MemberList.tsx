import type { Member } from '../slices/membersSlice';
import MemberActions from './MemberActions';
import './MemberList.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface MemberListProps {
  members: Member[];
  currentUserId: string | null;
  adminCount: number;
  onChangeRole: (memberId: string, role: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export default function MemberList({
  members,
  currentUserId,
  adminCount,
  onChangeRole,
  onRemove,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="member-list-empty" data-testid="member-list-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        <p>No members yet. Invite someone to get started.</p>
      </div>
    );
  }

  return (
    <div className="member-list" data-testid="member-list">
      <div className="member-list-header">
        <span className="member-list-col member-list-col-name">Name</span>
        <span className="member-list-col member-list-col-email">Email</span>
        <span className="member-list-col member-list-col-role">Role</span>
        <span className="member-list-col member-list-col-teams">Teams</span>
        <span className="member-list-col member-list-col-actions"></span>
      </div>
      {members.map((member) => {
        const isSelf = member.id === currentUserId;
        const isLastAdmin = member.role === 'admin' && adminCount <= 1;

        return (
          <div
            key={member.id}
            className="member-row"
            data-testid={`member-row-${member.id}`}
          >
            <div className="member-row-name">
              <div className="member-avatar" data-testid={`member-avatar-${member.id}`}>
                {getInitials(member.name)}
              </div>
              <span className="member-name" data-testid={`member-name-${member.id}`}>
                {member.name}
              </span>
            </div>
            <div className="member-row-email">
              <span className="member-email" data-testid={`member-email-${member.id}`}>
                {member.email}
              </span>
            </div>
            <div className="member-row-role">
              <span
                className={`member-role-badge ${member.role === 'admin' ? 'member-role-badge-admin' : 'member-role-badge-member'}`}
                data-testid={`member-role-badge-${member.id}`}
              >
                {member.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <div className="member-row-teams" data-testid={`member-teams-${member.id}`}>
              {member.teams.map((team) => (
                <span
                  key={team.id}
                  className="member-team-badge"
                  data-testid={`member-team-badge-${member.id}-${team.id}`}
                >
                  {team.name}
                </span>
              ))}
            </div>
            <div className="member-row-actions">
              <MemberActions
                member={member}
                isSelf={isSelf}
                isLastAdmin={isLastAdmin}
                onChangeRole={onChangeRole}
                onRemove={onRemove}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
