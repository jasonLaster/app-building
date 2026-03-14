import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Team {
  id: string;
  name: string;
  identifier: string;
  description: string;
  member_count: number;
  active_cycle_name: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface TeamDetail {
  id: string;
  name: string;
  identifier: string;
  description: string;
}

interface TeamsState {
  items: Team[];
  selectedTeam: TeamDetail | null;
  teamMembers: TeamMember[];
  availableMembers: TeamMember[];
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  items: [],
  selectedTeam: null,
  teamMembers: [],
  availableMembers: [],
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/teams', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch teams');
    }
    const data = await response.json();
    return data.teams as Team[];
  }
);

export const fetchTeamDetail = createAsyncThunk(
  'teams/fetchTeamDetail',
  async (teamId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch team details');
    }
    const data = await response.json();
    return data as { team: TeamDetail; members: TeamMember[]; availableMembers: TeamMember[] };
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (payload: { name: string; identifier: string; description: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to create team');
    }
    return data.team as Team;
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async (payload: { teamId: string; name?: string; identifier?: string; description?: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const { teamId, ...updates } = payload;
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to update team');
    }
    return data.team as TeamDetail;
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || 'Failed to delete team');
    }
    return teamId;
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async (payload: { teamId: string; memberIdToAdd: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/team-members', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to add member');
    }
    return data.member as TeamMember;
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async (payload: { teamId: string; memberIdToRemove: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/team-members', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || 'Failed to remove member');
    }
    return payload.memberIdToRemove;
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamDetail(state) {
      state.selectedTeam = null;
      state.teamMembers = [];
      state.availableMembers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeamDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTeam = action.payload.team;
        state.teamMembers = action.payload.members;
        state.availableMembers = action.payload.availableMembers;
      })
      .addCase(fetchTeamDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.selectedTeam = action.payload;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          const item = state.items[idx]!;
          item.name = action.payload.name;
          item.identifier = action.payload.identifier;
          item.description = action.payload.description;
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        state.selectedTeam = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.teamMembers.push(action.payload);
        state.availableMembers = state.availableMembers.filter((m) => m.id !== action.payload.id);
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        const removed = state.teamMembers.find((m) => m.id === action.payload);
        state.teamMembers = state.teamMembers.filter((m) => m.id !== action.payload);
        if (removed) {
          state.availableMembers.push(removed);
          state.availableMembers.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
  },
});

export const { clearTeamDetail } = teamsSlice.actions;
export default teamsSlice.reducer;
