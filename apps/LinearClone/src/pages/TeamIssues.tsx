import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTeamIssues } from '../slices/teamIssuesSlice';
import { fetchLabels } from '../slices/labelsSlice';
import { openCreateIssueModal } from '../slices/uiSlice';
import TeamFilters from '../components/TeamFilters';
import GroupBySort from '../components/GroupBySort';
import BulkActions from '../components/BulkActions';
import TeamIssuesList from '../components/TeamIssuesList';
import './TeamIssues.css';

export default function TeamIssues() {
  const { teamId } = useParams<{ teamId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: teams } = useSelector((state: RootState) => state.teams);
  const { items: teamIssues, loading } = useSelector((state: RootState) => state.teamIssues);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);

  const team = teams.find((t) => t.id === teamId);

  useEffect(() => {
    if (token && teamId) {
      dispatch(fetchTeamIssues(teamId));
      dispatch(fetchLabels());
    }
  }, [dispatch, token, teamId]);

  const filteredIssues = useMemo(() => {
    return teamIssues.filter((issue) => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(issue.status)) {
        return false;
      }
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(issue.priority)) {
        return false;
      }
      if (selectedAssignees.length > 0) {
        const matchesAssignee = selectedAssignees.some((a) => {
          if (a === 'unassigned') return !issue.assigneeId;
          return issue.assigneeId === a;
        });
        if (!matchesAssignee) return false;
      }
      if (selectedLabels.length > 0) {
        const issueLabelIds = issue.labels.map((l) => l.id);
        if (!selectedLabels.some((labelId) => issueLabelIds.includes(labelId))) {
          return false;
        }
      }
      if (selectedProjects.length > 0) {
        const matchesProject = selectedProjects.some((p) => {
          if (p === 'none') return !issue.projectId;
          return issue.projectId === p;
        });
        if (!matchesProject) return false;
      }
      if (selectedCycles.length > 0) {
        const matchesCycle = selectedCycles.some((c) => {
          if (c === 'none') return !issue.cycleId;
          return issue.cycleId === c;
        });
        if (!matchesCycle) return false;
      }
      return true;
    });
  }, [teamIssues, selectedStatuses, selectedPriorities, selectedAssignees, selectedLabels, selectedProjects, selectedCycles]);

  function handleNewIssue() {
    dispatch(openCreateIssueModal());
  }

  return (
    <div className="team-issues-page" data-testid="team-issues-page">
      <div className="team-issues-header">
        <div className="team-issues-header-left">
          <h1 className="team-issues-title" data-testid="team-issues-title">
            {team?.name || 'Team'} Issues
          </h1>
        </div>
        <button
          className="team-issues-new-btn"
          onClick={handleNewIssue}
          data-testid="new-issue-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Issue
        </button>
      </div>

      <div className="team-issues-toolbar">
        <TeamFilters
          selectedStatuses={selectedStatuses}
          selectedPriorities={selectedPriorities}
          selectedAssignees={selectedAssignees}
          selectedLabels={selectedLabels}
          selectedProjects={selectedProjects}
          selectedCycles={selectedCycles}
          onStatusChange={setSelectedStatuses}
          onPriorityChange={setSelectedPriorities}
          onAssigneeChange={setSelectedAssignees}
          onLabelChange={setSelectedLabels}
          onProjectChange={setSelectedProjects}
          onCycleChange={setSelectedCycles}
        />
        <GroupBySort />
      </div>

      <BulkActions teamId={teamId || ''} />
      <TeamIssuesList issues={filteredIssues} loading={loading} />
    </div>
  );
}
