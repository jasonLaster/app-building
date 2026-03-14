import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Issue } from './issuesSlice';
import { updateIssueStatus } from './issuesSlice';

export interface CycleSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teamId: string;
  issueCount: number;
  doneCount: number;
  inProgressCount: number;
  isActive: boolean;
}

export interface CycleIssue extends Issue {
  cycleName: string | null;
}

export interface BurndownEntry {
  date: string;
  count: number;
}

export interface CycleDetail {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teamId: string;
}

interface CycleDetailMember {
  id: string;
  name: string;
  email: string;
}

interface CyclesState {
  cycles: CycleSummary[];
  loading: boolean;
  error: string | null;
  selectedCycleId: string | null;
  cycleDetail: CycleDetail | null;
  cycleIssues: CycleIssue[];
  cycleMembers: CycleDetailMember[];
  burndown: BurndownEntry[];
  detailLoading: boolean;
  detailError: string | null;
  groupBy: 'status' | 'priority' | 'assignee' | 'project' | 'label' | 'none';
  sortBy: 'priority' | 'created' | 'updated' | 'status';
  selectedIds: string[];
}

const initialState: CyclesState = {
  cycles: [],
  loading: false,
  error: null,
  selectedCycleId: null,
  cycleDetail: null,
  cycleIssues: [],
  cycleMembers: [],
  burndown: [],
  detailLoading: false,
  detailError: null,
  groupBy: 'status',
  sortBy: 'priority',
  selectedIds: [],
};

export const fetchCycles = createAsyncThunk(
  'cycles/fetchCycles',
  async (teamId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/cycles?teamId=${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch cycles');
    }
    return await response.json() as { cycles: CycleSummary[] };
  }
);

export const fetchCycleIssues = createAsyncThunk(
  'cycles/fetchCycleIssues',
  async (cycleId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/cycle-issues?cycleId=${cycleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch cycle issues');
    }
    return await response.json() as {
      cycle: CycleDetail;
      issues: CycleIssue[];
      members: CycleDetailMember[];
      burndown: BurndownEntry[];
    };
  }
);

export const createCycle = createAsyncThunk(
  'cycles/createCycle',
  async (
    payload: { teamId: string; name: string; startDate: string; endDate: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/cycles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to create cycle');
    }
    return await response.json() as CycleSummary;
  }
);

const cyclesSlice = createSlice({
  name: 'cycles',
  initialState,
  reducers: {
    setSelectedCycleId(state, action: { payload: string | null }) {
      state.selectedCycleId = action.payload;
    },
    setCycleGroupBy(state, action: { payload: CyclesState['groupBy'] }) {
      state.groupBy = action.payload;
    },
    setCycleSortBy(state, action: { payload: CyclesState['sortBy'] }) {
      state.sortBy = action.payload;
    },
    toggleCycleIssueSelection(state, action: { payload: string }) {
      const id = action.payload;
      const idx = state.selectedIds.indexOf(id);
      if (idx >= 0) {
        state.selectedIds.splice(idx, 1);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectCycleGroupIssues(state, action: { payload: string[] }) {
      const ids = action.payload;
      const allSelected = ids.every((id) => state.selectedIds.includes(id));
      if (allSelected) {
        state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
      } else {
        const newIds = ids.filter((id) => !state.selectedIds.includes(id));
        state.selectedIds.push(...newIds);
      }
    },
    clearCycleSelection(state) {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCycles.pending, (state) => {
        if (state.cycles.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload.cycles;
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCycleIssues.pending, (state) => {
        if (state.cycleIssues.length === 0) {
          state.detailLoading = true;
        }
        state.detailError = null;
      })
      .addCase(fetchCycleIssues.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.cycleDetail = action.payload.cycle;
        state.cycleIssues = action.payload.issues;
        state.cycleMembers = action.payload.members;
        state.burndown = action.payload.burndown;
        state.selectedIds = [];
      })
      .addCase(fetchCycleIssues.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      })
      .addCase(createCycle.fulfilled, (state, action) => {
        state.cycles.push(action.payload);
        state.cycles.sort((a, b) => a.startDate.localeCompare(b.startDate));
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const { issueId, status } = action.payload;
        const issue = state.cycleIssues.find((i) => i.id === issueId);
        if (issue) {
          issue.status = status;
        }
      });
  },
});

export const {
  setSelectedCycleId,
  setCycleGroupBy,
  setCycleSortBy,
  toggleCycleIssueSelection,
  selectCycleGroupIssues,
  clearCycleSelection,
} = cyclesSlice.actions;

export default cyclesSlice.reducer;
