import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelsState {
  items: Label[];
  loading: boolean;
  error: string | null;
}

const initialState: LabelsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/labels', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return rejectWithValue('Failed to fetch labels');
    }
    const data = await response.json();
    return data.labels as Label[];
  }
);

const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabels.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default labelsSlice.reducer;
