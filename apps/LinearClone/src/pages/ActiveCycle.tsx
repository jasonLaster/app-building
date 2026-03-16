import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchCycles,
  fetchCycleIssues,
  setSelectedCycleId,
  createCycle,
} from '../slices/cyclesSlice';
import CycleList from '../components/CycleList';
import CycleDetail from '../components/CycleDetail';
import CreateCycle from '../components/CreateCycle';
import './ActiveCycle.css';

export default function ActiveCycle() {
  const { teamId } = useParams<{ teamId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: teams } = useSelector((state: RootState) => state.teams);
  const { cycles, loading, selectedCycleId, cycleDetail } = useSelector((state: RootState) => state.cycles);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const team = teams.find((t) => t.id === teamId);

  useEffect(() => {
    if (token && teamId) {
      dispatch(fetchCycles(teamId));
    }
  }, [dispatch, token, teamId]);

  // When cycles load, auto-select the active cycle if no cycle is selected
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycleId) {
      const activeCycle = cycles.find((c) => c.isActive);
      if (activeCycle) {
        dispatch(setSelectedCycleId(activeCycle.id));
      }
    }
  }, [cycles, selectedCycleId, dispatch]);

  // Clear selected cycle when team changes
  useEffect(() => {
    dispatch(setSelectedCycleId(null));
  }, [teamId, dispatch]);

  // Fetch cycle issues when selected cycle changes
  useEffect(() => {
    if (selectedCycleId && token) {
      dispatch(fetchCycleIssues(selectedCycleId));
    }
  }, [selectedCycleId, token, dispatch]);

  function handleSelectCycle(cycleId: string) {
    dispatch(setSelectedCycleId(cycleId));
  }

  async function handleCreateCycle(data: { name: string; startDate: string; endDate: string }) {
    if (!teamId) return;
    await dispatch(createCycle({
      teamId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    })).unwrap();
    setCreateModalOpen(false);
    // Show list view so user can see the new cycle
    dispatch(setSelectedCycleId(null));
    // Refetch cycles to get updated data
    dispatch(fetchCycles(teamId));
  }

  function handleBackToList() {
    dispatch(setSelectedCycleId(null));
  }

  return (
    <div className="active-cycle-page" data-testid="active-cycle-page">
      <div className="active-cycle-header">
        <div className="active-cycle-header-left">
          {selectedCycleId && cycleDetail && (
            <button
              className="active-cycle-back-btn"
              onClick={handleBackToList}
              data-testid="cycle-back-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <h1 className="active-cycle-title" data-testid="active-cycle-title">
            {team?.name || 'Team'} Cycles
          </h1>
        </div>
        <button
          className="active-cycle-new-btn"
          onClick={() => setCreateModalOpen(true)}
          data-testid="new-cycle-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Cycle
        </button>
      </div>

      {selectedCycleId && cycleDetail ? (
        <CycleDetail />
      ) : (
        <CycleList
          cycles={cycles}
          loading={loading}
          selectedCycleId={selectedCycleId}
          onSelectCycle={handleSelectCycle}
        />
      )}

      <CreateCycle
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCycle}
      />
    </div>
  );
}
