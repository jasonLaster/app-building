import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceState {
  workspace: Workspace | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspace: null,
  loading: false,
  error: null,
};

export const fetchWorkspace = createAsyncThunk(
  'workspace/fetchWorkspace',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/workspace', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch workspace');
    }
    const data = await response.json();
    return data.workspace as Workspace;
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspace.pending, (state) => {
        if (!state.workspace) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.workspace = action.payload;
      })
      .addCase(fetchWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default workspaceSlice.reducer;
