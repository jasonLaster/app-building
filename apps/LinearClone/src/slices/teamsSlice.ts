import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Team {
  id: string;
  name: string;
  identifier: string;
  description: string;
  member_count: number;
}

interface TeamsState {
  items: Team[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  items: [],
  loading: false,
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

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
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
      });
  },
});

export default teamsSlice.reducer;
