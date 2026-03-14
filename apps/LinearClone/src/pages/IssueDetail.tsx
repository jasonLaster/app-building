import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchIssueDetail, clearIssueDetail } from '../slices/issueDetailSlice';
import IssueHeader from '../components/IssueHeader';
import IssueDescription from '../components/IssueDescription';
import SubIssues from '../components/SubIssues';
import ActivityComments from '../components/ActivityComments';
import IssueSidebar from '../components/IssueSidebar';
import './IssueDetail.css';

export default function IssueDetail() {
  const { issueId } = useParams<{ issueId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { issue, subIssues, activity, comments, members, projects, cycles, allLabels, loading, error } =
    useSelector((state: RootState) => state.issueDetail);

  useEffect(() => {
    if (token && issueId) {
      dispatch(fetchIssueDetail(issueId));
    }
    return () => {
      dispatch(clearIssueDetail());
    };
  }, [dispatch, token, issueId]);

  if (loading) {
    return (
      <div className="issue-detail-page" data-testid="issue-detail-page">
        <div className="issue-detail-loading" data-testid="issue-detail-loading">Loading...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="issue-detail-page" data-testid="issue-detail-page">
        <div className="issue-detail-error" data-testid="issue-detail-error">
          {error || 'Issue not found'}
          <button
            className="issue-detail-back-btn"
            onClick={() => navigate(-1)}
            data-testid="issue-detail-back-btn"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-detail-page" data-testid="issue-detail-page">
      <div className="issue-detail-layout" data-testid="issue-detail-layout">
        <div className="issue-detail-main" data-testid="issue-detail-main">
          <IssueHeader issue={issue} />
          <IssueDescription issueId={issue.id} description={issue.description} />
          <SubIssues parentIssue={issue} subIssues={subIssues} />
          <ActivityComments issueId={issue.id} activity={activity} comments={comments} />
        </div>
        <div className="issue-detail-sidebar" data-testid="issue-detail-sidebar">
          <IssueSidebar
            issue={issue}
            members={members}
            projects={projects}
            cycles={cycles}
            allLabels={allLabels}
          />
        </div>
      </div>
    </div>
  );
}
