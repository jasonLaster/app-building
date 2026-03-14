import { Link } from 'react-router-dom';
import type { Project } from '../slices/projectsSlice';
import './ProjectCard.css';

const PROJECT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  planned: { label: 'Planned', className: 'project-badge-planned' },
  in_progress: { label: 'In Progress', className: 'project-badge-in-progress' },
  completed: { label: 'Completed', className: 'project-badge-completed' },
  cancelled: { label: 'Cancelled', className: 'project-badge-cancelled' },
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const percentage = project.totalIssues > 0
    ? Math.round((project.completedIssues / project.totalIssues) * 100)
    : 0;

  const statusCfg = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.planned;

  function formatTargetDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="project-card" data-testid={`project-card-${project.id}`}>
      <div className="project-card-header">
        <Link
          to={`/project/${project.id}`}
          className="project-card-name"
          data-testid={`project-card-name-${project.id}`}
        >
          {project.name}
        </Link>
        <span
          className={`project-card-badge ${statusCfg.className}`}
          data-testid={`project-card-status-${project.id}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <div className="project-card-meta">
        {/* Lead */}
        <div className="project-card-lead" data-testid={`project-card-lead-${project.id}`}>
          {project.leadName ? (
            <>
              <span className="project-card-avatar">
                {getInitials(project.leadName)}
              </span>
              <span className="project-card-lead-name">{project.leadName}</span>
            </>
          ) : (
            <span className="project-card-no-lead">No lead</span>
          )}
        </div>

        {/* Target Date */}
        <div className="project-card-date" data-testid={`project-card-date-${project.id}`}>
          {project.targetDate ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatTargetDate(project.targetDate)}</span>
            </>
          ) : (
            <span className="project-card-no-date">No target date</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="project-card-progress" data-testid={`project-card-progress-${project.id}`}>
        <div className="project-card-progress-bar">
          <div
            className={`project-card-progress-fill ${percentage === 100 ? 'project-card-progress-complete' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="project-card-progress-text">
          {project.completedIssues}/{project.totalIssues} ({percentage}%)
        </span>
      </div>

      {/* Team Icons */}
      {project.teams.length > 0 && (
        <div className="project-card-teams" data-testid={`project-card-teams-${project.id}`}>
          {project.teams.map((team) => (
            <span
              key={team.id}
              className="project-card-team-icon"
              title={team.name}
              data-testid={`project-card-team-${project.id}-${team.id}`}
            >
              {team.identifier.slice(0, 2)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
