import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface ProjectTeam {
  id: string;
  name: string;
  identifier: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  targetDate: string | null;
  leadId: string | null;
  leadName: string | null;
  leadEmail: string | null;
  totalIssues: number;
  completedIssues: number;
  teams: ProjectTeam[];
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
}

export interface ProjectTeamFilter {
  id: string;
  name: string;
  identifier: string;
}

interface ProjectsState {
  items: Project[];
  members: ProjectMember[];
  teams: ProjectTeamFilter[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  members: [],
  teams: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch projects');
    }
    return await response.json() as {
      projects: Project[];
      members: ProjectMember[];
      teams: ProjectTeamFilter[];
    };
  }
);

export interface CreateProjectPayload {
  name: string;
  description: string;
  status: string;
  leadId: string | null;
  targetDate: string | null;
  teamIds: string[];
}

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (payload: CreateProjectPayload, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to create project');
    }
    return await response.json() as Project;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.projects;
        state.members = action.payload.members;
        state.teams = action.payload.teams;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default projectsSlice.reducer;
