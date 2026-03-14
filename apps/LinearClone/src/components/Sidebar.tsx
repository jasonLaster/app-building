import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { fetchTeams } from '../slices/teamsSlice';
import { fetchWorkspace } from '../slices/workspaceSlice';
import { fetchUnreadCount } from '../slices/notificationsSlice';
import SidebarCollapse from './SidebarCollapse';
import './Sidebar.css';

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const { items: teams } = useSelector((state: RootState) => state.teams);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { token } = useSelector((state: RootState) => state.auth);

  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (token) {
      dispatch(fetchTeams());
      dispatch(fetchWorkspace());
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (teams.length > 0 && Object.keys(expandedTeams).length === 0) {
      const initial: Record<string, boolean> = {};
      for (const team of teams) {
        initial[team.id] = true;
      }
      setExpandedTeams(initial);
    }
  }, [teams, expandedTeams]);

  function toggleTeam(teamId: string) {
    setExpandedTeams((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  function isTeamActive(teamId: string, sub: string) {
    return location.pathname === `/team/${teamId}/${sub}`;
  }

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      data-testid="sidebar"
    >
      <div className="sidebar-header">
        <Link
          to="/my-issues"
          className="sidebar-workspace-name"
          data-testid="sidebar-workspace-name"
          title={workspace?.name || 'Workspace'}
        >
          <span className="sidebar-workspace-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="4" fill="var(--color-accent)" />
              <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
                {workspace?.name?.[0]?.toUpperCase() || 'W'}
              </text>
            </svg>
          </span>
          {!sidebarCollapsed && (
            <span className="sidebar-workspace-label">{workspace?.name || 'Workspace'}</span>
          )}
        </Link>
        <SidebarCollapse />
      </div>

      <nav className="sidebar-nav" data-testid="sidebar-nav">
        <div className="sidebar-section">
          <Link
            to="/my-issues"
            className={`sidebar-link ${isActive('/my-issues') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-my-issues"
            title="My Issues"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {!sidebarCollapsed && <span>My Issues</span>}
          </Link>
          <Link
            to="/inbox"
            className={`sidebar-link ${isActive('/inbox') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-inbox"
            title="Inbox"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            {!sidebarCollapsed && <span>Inbox</span>}
            {unreadCount > 0 && (
              <span className="sidebar-badge" data-testid="sidebar-inbox-badge">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {teams.length > 0 && (
          <div className="sidebar-section" data-testid="sidebar-teams-section">
            {!sidebarCollapsed && (
              <span className="sidebar-section-label">Teams</span>
            )}
            {teams.map((team) => (
              <div key={team.id} className="sidebar-team" data-testid={`sidebar-team-${team.id}`}>
                <button
                  className="sidebar-team-header"
                  onClick={() => toggleTeam(team.id)}
                  data-testid={`sidebar-team-header-${team.id}`}
                  title={team.name}
                >
                  {!sidebarCollapsed && (
                    <svg
                      className={`sidebar-chevron ${expandedTeams[team.id] ? 'sidebar-chevron-expanded' : ''}`}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  <span
                    className="sidebar-team-identifier"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff', borderRadius: '4px', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0 }}
                  >
                    {team.identifier?.[0] || team.name[0]}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="sidebar-team-name">{team.name}</span>
                  )}
                </button>
                {(expandedTeams[team.id] || sidebarCollapsed) && (
                  <div className="sidebar-team-links" data-testid={`sidebar-team-links-${team.id}`}>
                    <Link
                      to={`/team/${team.id}/issues`}
                      className={`sidebar-link sidebar-link-nested ${isTeamActive(team.id, 'issues') ? 'sidebar-link-active' : ''}`}
                      data-testid={`sidebar-link-team-issues-${team.id}`}
                      title="Issues"
                    >
                      <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      {!sidebarCollapsed && <span>Issues</span>}
                    </Link>
                    <Link
                      to={`/team/${team.id}/cycles`}
                      className={`sidebar-link sidebar-link-nested ${isTeamActive(team.id, 'cycles') ? 'sidebar-link-active' : ''}`}
                      data-testid={`sidebar-link-team-cycles-${team.id}`}
                      title="Active Cycle"
                    >
                      <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                      {!sidebarCollapsed && <span>Active Cycle</span>}
                    </Link>
                    <Link
                      to={`/team/${team.id}/projects`}
                      className={`sidebar-link sidebar-link-nested ${isTeamActive(team.id, 'projects') ? 'sidebar-link-active' : ''}`}
                      data-testid={`sidebar-link-team-projects-${team.id}`}
                      title="Projects"
                    >
                      <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {!sidebarCollapsed && <span>Projects</span>}
                    </Link>
                    <Link
                      to={`/team/${team.id}/views`}
                      className={`sidebar-link sidebar-link-nested ${isTeamActive(team.id, 'views') ? 'sidebar-link-active' : ''}`}
                      data-testid={`sidebar-link-team-views-${team.id}`}
                      title="Views"
                    >
                      <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      {!sidebarCollapsed && <span>Views</span>}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-section" data-testid="sidebar-workspace-section">
          {!sidebarCollapsed && (
            <span className="sidebar-section-label">Workspace</span>
          )}
          <Link
            to="/projects"
            className={`sidebar-link ${isActive('/projects') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-all-projects"
            title="All Projects"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            {!sidebarCollapsed && <span>All Projects</span>}
          </Link>
          <Link
            to="/settings/teams"
            className={`sidebar-link ${isActive('/settings/teams') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-all-teams"
            title="All Teams"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {!sidebarCollapsed && <span>All Teams</span>}
          </Link>
          <Link
            to="/settings/members"
            className={`sidebar-link ${isActive('/settings/members') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-members"
            title="Members"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            {!sidebarCollapsed && <span>Members</span>}
          </Link>
          <Link
            to="/settings/labels"
            className={`sidebar-link ${isActive('/settings/labels') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-labels"
            title="Labels"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            {!sidebarCollapsed && <span>Labels</span>}
          </Link>
          <Link
            to="/settings"
            className={`sidebar-link ${isActive('/settings') ? 'sidebar-link-active' : ''}`}
            data-testid="sidebar-link-settings"
            title="Settings"
          >
            <svg className="sidebar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>
    </aside>
  );
}
