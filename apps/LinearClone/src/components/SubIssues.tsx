import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { SubIssue } from '../slices/issueDetailSlice';
import type { Issue } from '../slices/issuesSlice';
import { openCreateIssueModal } from '../slices/uiSlice';
import { StatusIcon, PriorityIcon, STATUS_CONFIG } from './IssueRow';
import './SubIssues.css';

interface SubIssuesProps {
  parentIssue: Issue;
  subIssues: SubIssue[];
}

export default function SubIssues({ parentIssue, subIssues }: SubIssuesProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  function handleSubIssueClick(issueId: string) {
    navigate(`/issue/${issueId}`);
  }

  function handleAddSubIssue() {
    dispatch(openCreateIssueModal({ parentId: parentIssue.id, teamId: parentIssue.teamId }));
  }

  return (
    <div className="sub-issues" data-testid="sub-issues">
      <div className="sub-issues-header">
        <h3 className="sub-issues-title" data-testid="sub-issues-title">Sub-issues</h3>
        <button
          className="sub-issues-add-btn"
          onClick={handleAddSubIssue}
          data-testid="sub-issues-add-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add sub-issue
        </button>
      </div>

      {subIssues.length === 0 ? (
        <div className="sub-issues-empty" data-testid="sub-issues-empty">
          No sub-issues
        </div>
      ) : (
        <div className="sub-issues-list" data-testid="sub-issues-list">
          {subIssues.map((si) => {
            const statusCfg = STATUS_CONFIG[si.status] || STATUS_CONFIG.todo;
            return (
              <div
                key={si.id}
                className="sub-issue-row"
                data-testid={`sub-issue-row-${si.id}`}
              >
                <div className="sub-issue-left">
                  <span className="sub-issue-status" data-testid={`sub-issue-status-${si.id}`}>
                    <StatusIcon status={si.status} color={statusCfg.color} />
                  </span>
                  <span className="sub-issue-priority" data-testid={`sub-issue-priority-${si.id}`}>
                    <PriorityIcon priority={si.priority} />
                  </span>
                  <span className="sub-issue-identifier" data-testid={`sub-issue-identifier-${si.id}`}>
                    {si.identifier}
                  </span>
                  <button
                    className="sub-issue-title"
                    onClick={() => handleSubIssueClick(si.id)}
                    data-testid={`sub-issue-title-${si.id}`}
                  >
                    {si.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
