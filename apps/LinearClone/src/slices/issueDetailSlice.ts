import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Issue, IssueLabel } from './issuesSlice';

export interface SubIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  identifier: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  createdAt: string;
  memberId: string;
  memberName: string | null;
  memberEmail: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  memberId: string;
  memberName: string | null;
  memberEmail: string | null;
}

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

interface IssueDetailState {
  issue: Issue | null;
  subIssues: SubIssue[];
  activity: ActivityEntry[];
  comments: Comment[];
  members: TeamMember[];
  projects: TeamProject[];
  cycles: TeamCycle[];
  allLabels: IssueLabel[];
  loading: boolean;
  error: string | null;
}

const initialState: IssueDetailState = {
  issue: null,
  subIssues: [],
  activity: [],
  comments: [],
  members: [],
  projects: [],
  cycles: [],
  allLabels: [],
  loading: false,
  error: null,
};

export const fetchIssueDetail = createAsyncThunk(
  'issueDetail/fetchIssueDetail',
  async (issueId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/issue-detail?issueId=${issueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch issue');
    }
    return await response.json();
  }
);

export const updateIssueField = createAsyncThunk(
  'issueDetail/updateIssueField',
  async (
    payload: { issueId: string; field: string; value: string | null; labelIds?: string[] },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/update-issue', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to update issue');
    }
    return await response.json() as { issue: Issue; activity: ActivityEntry | null };
  }
);

export const addComment = createAsyncThunk(
  'issueDetail/addComment',
  async (
    payload: { issueId: string; content: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/add-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to add comment');
    }
    return await response.json() as { comment: Comment };
  }
);

const issueDetailSlice = createSlice({
  name: 'issueDetail',
  initialState,
  reducers: {
    clearIssueDetail(state) {
      state.issue = null;
      state.subIssues = [];
      state.activity = [];
      state.comments = [];
      state.members = [];
      state.projects = [];
      state.cycles = [];
      state.allLabels = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssueDetail.pending, (state) => {
        if (!state.issue) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchIssueDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.issue = action.payload.issue;
        state.subIssues = action.payload.subIssues;
        state.activity = action.payload.activity;
        state.comments = action.payload.comments;
        state.members = action.payload.members;
        state.projects = action.payload.projects;
        state.cycles = action.payload.cycles;
        state.allLabels = action.payload.allLabels;
      })
      .addCase(fetchIssueDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateIssueField.fulfilled, (state, action) => {
        state.issue = action.payload.issue;
        if (action.payload.activity) {
          state.activity.push(action.payload.activity);
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload.comment);
      });
  },
});

export const { clearIssueDetail } = issueDetailSlice.actions;
export default issueDetailSlice.reducer;
