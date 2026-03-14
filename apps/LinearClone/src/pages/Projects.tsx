import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchProjects, createProject } from '../slices/projectsSlice';
import ProjectCard from '../components/ProjectCard';
import ProjectFilters from '../components/ProjectFilters';
import CreateProjectModal from '../components/CreateProjectModal';
import type { CreateProjectFormData } from '../components/CreateProjectModal';
import './Projects.css';

export default function Projects() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: projects, members, teams, loading } = useSelector((state: RootState) => state.projects);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects());
    }
  }, [dispatch, token]);

  async function handleCreateProject(data: CreateProjectFormData) {
    await dispatch(createProject({
      name: data.name.trim(),
      description: data.description,
      status: data.status,
      leadId: data.leadId,
      targetDate: data.targetDate,
      teamIds: data.teamIds,
    })).unwrap();
    setCreateModalOpen(false);
    dispatch(fetchProjects());
  }

  // Apply filters
  const filteredProjects = projects.filter((project) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) {
      return false;
    }
    if (selectedLeads.length > 0 && (!project.leadId || !selectedLeads.includes(project.leadId))) {
      return false;
    }
    if (selectedTeams.length > 0) {
      const projectTeamIds = project.teams.map((t) => t.id);
      const hasMatchingTeam = selectedTeams.some((tid) => projectTeamIds.includes(tid));
      if (!hasMatchingTeam) return false;
    }
    return true;
  });

  return (
    <div className="projects-page" data-testid="projects-page">
      <div className="projects-header">
        <h1 className="projects-title" data-testid="projects-title">Projects</h1>
        <button
          className="projects-create-btn"
          onClick={() => setCreateModalOpen(true)}
          data-testid="create-project-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Project
        </button>
      </div>

      <ProjectFilters
        selectedStatuses={selectedStatuses}
        selectedLeads={selectedLeads}
        selectedTeams={selectedTeams}
        onStatusChange={setSelectedStatuses}
        onLeadChange={setSelectedLeads}
        onTeamChange={setSelectedTeams}
        members={members}
        teams={teams}
      />

      {loading ? (
        <div className="projects-loading" data-testid="projects-loading">
          Loading...
        </div>
      ) : filteredProjects.length === 0 && projects.length === 0 ? (
        <div className="projects-empty" data-testid="projects-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="projects-empty" data-testid="projects-no-results">
          <p>No projects match the current filters.</p>
        </div>
      ) : (
        <div className="projects-grid" data-testid="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        members={members}
        teams={teams}
      />
    </div>
  );
}
