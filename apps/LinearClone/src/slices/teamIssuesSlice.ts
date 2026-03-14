import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Issue } from './issuesSlice';
import { updateIssueStatus } from './issuesSlice';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface TeamProject {
  id: string;
  name: string;
}

export interface TeamCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface TeamIssue extends Issue {
  cycleName: string | null;
}

interface TeamIssuesState {
  items: TeamIssue[];
  members: TeamMember[];
  projects: TeamProject[];
  cycles: TeamCycle[];
  loading: boolean;
  error: string | null;
  selectedIds: string[];
  groupBy: 'status' | 'priority' | 'assignee' | 'project' | 'label' | 'none';
  sortBy: 'priority' | 'created' | 'updated' | 'status';
}

const initialState: TeamIssuesState = {
  items: [],
  members: [],
  projects: [],
  cycles: [],
  loading: false,
  error: null,
  selectedIds: [],
  groupBy: 'status',
  sortBy: 'priority',
};

export const fetchTeamIssues = createAsyncThunk(
  'teamIssues/fetchTeamIssues',
  async (teamId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/team-issues?teamId=${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch team issues');
    }
    return await response.json() as {
      issues: TeamIssue[];
      members: TeamMember[];
      projects: TeamProject[];
      cycles: TeamCycle[];
    };
  }
);

export const bulkUpdateIssues = createAsyncThunk(
  'teamIssues/bulkUpdateIssues',
  async (
    payload: {
      issueIds: string[];
      status?: string;
      priority?: string;
      assigneeId?: string | null;
      labelId?: string;
      teamId: string;
    },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const { teamId, ...body } = payload;
    const response = await fetch('/api/bulk-update-issues', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to bulk update issues');
    }
    // Refetch team issues to get updated data
    dispatch(fetchTeamIssues(teamId));
    return payload;
  }
);

const teamIssuesSlice = createSlice({
  name: 'teamIssues',
  initialState,
  reducers: {
    toggleIssueSelection(state, action: { payload: string }) {
      const id = action.payload;
      const idx = state.selectedIds.indexOf(id);
      if (idx >= 0) {
        state.selectedIds.splice(idx, 1);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectGroupIssues(state, action: { payload: string[] }) {
      const ids = action.payload;
      const allSelected = ids.every((id) => state.selectedIds.includes(id));
      if (allSelected) {
        state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
      } else {
        const newIds = ids.filter((id) => !state.selectedIds.includes(id));
        state.selectedIds.push(...newIds);
      }
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
    setGroupBy(state, action: { payload: TeamIssuesState['groupBy'] }) {
      state.groupBy = action.payload;
    },
    setSortBy(state, action: { payload: TeamIssuesState['sortBy'] }) {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamIssues.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchTeamIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.issues;
        state.members = action.payload.members;
        state.projects = action.payload.projects;
        state.cycles = action.payload.cycles;
      })
      .addCase(fetchTeamIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bulkUpdateIssues.fulfilled, (state) => {
        state.selectedIds = [];
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const { issueId, status } = action.payload;
        const issue = state.items.find((i) => i.id === issueId);
        if (issue) {
          issue.status = status;
        }
      });
  },
});

export const {
  toggleIssueSelection,
  selectGroupIssues,
  clearSelection,
  setGroupBy,
  setSortBy,
} = teamIssuesSlice.actions;

export default teamIssuesSlice.reducer;
