import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface NotificationsState {
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  unreadCount: 0,
  loading: false,
};

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/notifications-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch notifications');
    }
    const data = await response.json();
    return data.count as number;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    decrementUnreadCount(state) {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { decrementUnreadCount, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
