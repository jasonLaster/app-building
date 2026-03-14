import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchProjectDetail, clearProjectDetail } from '../slices/projectDetailSlice';
import ProjectHeader from '../components/ProjectHeader';
import ProjectIssuesTab from '../components/ProjectIssuesTab';
import ProjectOverviewTab from '../components/ProjectOverviewTab';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { project, members, loading, error } = useSelector(
    (state: RootState) => state.projectDetail
  );
  const [activeTab, setActiveTab] = useState<'issues' | 'overview'>('issues');

  useEffect(() => {
    if (token && projectId) {
      dispatch(fetchProjectDetail(projectId));
    }
    return () => {
      dispatch(clearProjectDetail());
    };
  }, [dispatch, token, projectId]);

  if (loading) {
    return (
      <div className="project-detail-page" data-testid="project-detail-page">
        <div className="project-detail-loading" data-testid="project-detail-loading">Loading...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page" data-testid="project-detail-page">
        <div className="project-detail-error" data-testid="project-detail-error">
          {error || 'Project not found'}
          <button
            className="project-detail-back-btn"
            onClick={() => navigate(-1)}
            data-testid="project-detail-back-btn"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page" data-testid="project-detail-page">
      <ProjectHeader
        project={project}
        members={members}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="project-detail-content" data-testid="project-detail-content">
        {activeTab === 'issues' ? (
          <ProjectIssuesTab />
        ) : (
          <ProjectOverviewTab />
        )}
      </div>
    </div>
  );
}
