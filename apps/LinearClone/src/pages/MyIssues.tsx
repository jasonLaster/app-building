import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchMyIssues } from '../slices/issuesSlice';
import { fetchLabels } from '../slices/labelsSlice';
import FiltersToolbar from '../components/FiltersToolbar';
import MyIssuesList from '../components/MyIssuesList';
import './MyIssues.css';

export default function MyIssues() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { myIssues, loading } = useSelector((state: RootState) => state.issues);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      dispatch(fetchMyIssues());
      dispatch(fetchLabels());
    }
  }, [dispatch, token]);

  const filteredIssues = useMemo(() => {
    return myIssues.filter((issue) => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(issue.status)) {
        return false;
      }
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(issue.priority)) {
        return false;
      }
      if (selectedLabels.length > 0) {
        const issueLabelIds = issue.labels.map((l) => l.id);
        if (!selectedLabels.some((labelId) => issueLabelIds.includes(labelId))) {
          return false;
        }
      }
      return true;
    });
  }, [myIssues, selectedStatuses, selectedPriorities, selectedLabels]);

  return (
    <div className="my-issues-page" data-testid="my-issues-page">
      <div className="my-issues-header">
        <h1 className="my-issues-title" data-testid="my-issues-title">My Issues</h1>
      </div>
      <FiltersToolbar
        selectedStatuses={selectedStatuses}
        selectedPriorities={selectedPriorities}
        selectedLabels={selectedLabels}
        onStatusChange={setSelectedStatuses}
        onPriorityChange={setSelectedPriorities}
        onLabelChange={setSelectedLabels}
      />
      <MyIssuesList issues={filteredIssues} loading={loading} />
    </div>
  );
}
