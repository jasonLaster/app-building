import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Issue, IssueLabel } from './issuesSlice';
import { updateIssueStatus } from './issuesSlice';

export interface ProjectDetail {
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
  inProgressIssues: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  targetDate: string | null;
  completed: boolean;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
}

export interface ProjectActivityEntry {
  id: string;
  action: string;
  createdAt: string;
  memberId: string;
  memberName: string | null;
  memberEmail: string | null;
}

interface ProjectDetailState {
  project: ProjectDetail | null;
  issues: Issue[];
  milestones: ProjectMilestone[];
  members: ProjectMember[];
  labels: IssueLabel[];
  activity: ProjectActivityEntry[];
  loading: boolean;
  error: string | null;
  selectedIssueIds: string[];
}

const initialState: ProjectDetailState = {
  project: null,
  issues: [],
  milestones: [],
  members: [],
  labels: [],
  activity: [],
  loading: false,
  error: null,
  selectedIssueIds: [],
};

export const fetchProjectDetail = createAsyncThunk(
  'projectDetail/fetchProjectDetail',
  async (projectId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/project-detail?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch project');
    }
    return await response.json();
  }
);

export const updateProjectField = createAsyncThunk(
  'projectDetail/updateProjectField',
  async (
    payload: { projectId: string; field: string; value: string | null },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/update-project', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to update project');
    }
    return await response.json() as {
      project: ProjectDetail;
      activity: ProjectActivityEntry | null;
    };
  }
);

export const createMilestone = createAsyncThunk(
  'projectDetail/createMilestone',
  async (
    payload: { projectId: string; name: string; targetDate: string | null },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/project-milestones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to create milestone');
    }
    return await response.json() as { milestone: ProjectMilestone };
  }
);

export const updateMilestone = createAsyncThunk(
  'projectDetail/updateMilestone',
  async (
    payload: { milestoneId: string; projectId: string; name?: string; targetDate?: string | null; completed?: boolean },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/project-milestones', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to update milestone');
    }
    return await response.json() as { milestone: ProjectMilestone };
  }
);

export const deleteMilestone = createAsyncThunk(
  'projectDetail/deleteMilestone',
  async (
    payload: { milestoneId: string; projectId: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(
      `/api/project-milestones?milestoneId=${payload.milestoneId}&projectId=${payload.projectId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      return rejectWithValue('Failed to delete milestone');
    }
    return { milestoneId: payload.milestoneId };
  }
);

export const updateProjectIssueStatus = createAsyncThunk(
  'projectDetail/updateProjectIssueStatus',
  async (
    payload: { issueId: string; status: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/update-issue-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to update issue status');
    }
    const data = await response.json();
    return { issueId: payload.issueId, status: data.issue.status as string };
  }
);

export const bulkUpdateProjectIssues = createAsyncThunk(
  'projectDetail/bulkUpdateProjectIssues',
  async (
    payload: {
      issueIds: string[];
      projectId: string;
      status?: string;
      priority?: string;
      assigneeId?: string | null;
      labelId?: string;
    },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const { projectId, ...body } = payload;
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
    dispatch(fetchProjectDetail(projectId));
    return payload;
  }
);

const projectDetailSlice = createSlice({
  name: 'projectDetail',
  initialState,
  reducers: {
    clearProjectDetail(state) {
      state.project = null;
      state.issues = [];
      state.milestones = [];
      state.members = [];
      state.labels = [];
      state.activity = [];
      state.loading = false;
      state.error = null;
      state.selectedIssueIds = [];
    },
    toggleProjectIssueSelection(state, action: { payload: string }) {
      const id = action.payload;
      const idx = state.selectedIssueIds.indexOf(id);
      if (idx >= 0) {
        state.selectedIssueIds.splice(idx, 1);
      } else {
        state.selectedIssueIds.push(id);
      }
    },
    clearProjectIssueSelection(state) {
      state.selectedIssueIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectDetail.pending, (state) => {
        if (!state.project) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload.project;
        state.issues = action.payload.issues;
        state.milestones = action.payload.milestones;
        state.members = action.payload.members;
        state.labels = action.payload.labels;
        state.activity = action.payload.activity;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProjectField.fulfilled, (state, action) => {
        state.project = action.payload.project;
        if (action.payload.activity) {
          state.activity.unshift(action.payload.activity);
        }
      })
      .addCase(createMilestone.fulfilled, (state, action) => {
        state.milestones.push(action.payload.milestone);
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        const idx = state.milestones.findIndex((m) => m.id === action.payload.milestone.id);
        if (idx >= 0) {
          state.milestones[idx] = action.payload.milestone;
        }
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.milestones = state.milestones.filter((m) => m.id !== action.payload.milestoneId);
      })
      .addCase(updateProjectIssueStatus.fulfilled, (state, action) => {
        const { issueId, status } = action.payload;
        const issue = state.issues.find((i) => i.id === issueId);
        if (issue) {
          const wasDone = issue.status === 'done';
          const nowDone = status === 'done';
          const wasInProgress = issue.status === 'in_progress';
          const nowInProgress = status === 'in_progress';
          issue.status = status;
          // Update project counts
          if (state.project) {
            if (!wasDone && nowDone) {
              state.project.completedIssues += 1;
            } else if (wasDone && !nowDone) {
              state.project.completedIssues -= 1;
            }
            if (!wasInProgress && nowInProgress) {
              state.project.inProgressIssues += 1;
            } else if (wasInProgress && !nowInProgress) {
              state.project.inProgressIssues -= 1;
            }
          }
        }
      })
      .addCase(bulkUpdateProjectIssues.fulfilled, (state) => {
        state.selectedIssueIds = [];
      })
      // Cross-slice: handle status updates from IssueRow (issuesSlice)
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const { issueId, status } = action.payload;
        const issue = state.issues.find((i) => i.id === issueId);
        if (issue) {
          const wasDone = issue.status === 'done';
          const nowDone = status === 'done';
          const wasInProgress = issue.status === 'in_progress';
          const nowInProgress = status === 'in_progress';
          issue.status = status;
          if (state.project) {
            if (!wasDone && nowDone) {
              state.project.completedIssues += 1;
            } else if (wasDone && !nowDone) {
              state.project.completedIssues -= 1;
            }
            if (!wasInProgress && nowInProgress) {
              state.project.inProgressIssues += 1;
            } else if (wasInProgress && !nowInProgress) {
              state.project.inProgressIssues -= 1;
            }
          }
        }
      });
  },
});

export const {
  clearProjectDetail,
  toggleProjectIssueSelection,
  clearProjectIssueSelection,
} = projectDetailSlice.actions;
export default projectDetailSlice.reducer;
