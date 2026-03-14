import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  identifier: string;
  number: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: string;
  teamName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  projectId: string | null;
  projectName: string | null;
  cycleId: string | null;
  parentId: string | null;
  labels: IssueLabel[];
}

interface IssuesState {
  myIssues: Issue[];
  loading: boolean;
  error: string | null;
}

const initialState: IssuesState = {
  myIssues: [],
  loading: false,
  error: null,
};

export const fetchMyIssues = createAsyncThunk(
  'issues/fetchMyIssues',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/my-issues', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch issues');
    }
    const data = await response.json();
    return data.issues as Issue[];
  }
);

export interface CreateIssuePayload {
  teamId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  labelIds: string[];
  projectId: string | null;
  cycleId: string | null;
  dueDate: string | null;
  parentId: string | null;
}

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (payload: CreateIssuePayload, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/create-issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to create issue');
    }
    const data = await response.json();
    return data.issue as Issue;
  }
);

export const updateIssueStatus = createAsyncThunk(
  'issues/updateIssueStatus',
  async ({ issueId, status }: { issueId: string; status: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/update-issue-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ issueId, status }),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to update status');
    }
    const data = await response.json();
    return { issueId, status: data.issue.status as string };
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyIssues.pending, (state) => {
        if (state.myIssues.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.myIssues = action.payload;
      })
      .addCase(fetchMyIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.myIssues.unshift(action.payload);
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const { issueId, status } = action.payload;
        const issue = state.myIssues.find((i) => i.id === issueId);
        if (issue) {
          issue.status = status;
        }
      });
  },
});

export default issuesSlice.reducer;
