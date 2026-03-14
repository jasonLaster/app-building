import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface MemberTeam {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  teams: MemberTeam[];
}

interface MembersState {
  items: Member[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  items: [],
  currentUserId: null,
  loading: false,
  error: null,
};

export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/members', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch members');
    }
    const data = await response.json();
    return data as { members: Member[]; currentUserId: string };
  }
);

export const inviteMember = createAsyncThunk(
  'members/inviteMember',
  async (email: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to invite member');
    }
    return data.member as Member;
  }
);

export const updateMemberRole = createAsyncThunk(
  'members/updateMemberRole',
  async ({ memberId, role }: { memberId: string; role: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/members/${memberId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to update role');
    }
    return { memberId, role };
  }
);

export const removeMember = createAsyncThunk(
  'members/removeMember',
  async (memberId: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch(`/api/members/${memberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to remove member');
    }
    return memberId;
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.members;
        state.currentUserId = action.payload.currentUserId;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const member = state.items.find((m) => m.id === action.payload.memberId);
        if (member) {
          member.role = action.payload.role;
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export default membersSlice.reducer;
