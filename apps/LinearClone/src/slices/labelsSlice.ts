import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Label {
  id: string;
  name: string;
  color: string;
  issue_count: number;
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

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async (payload: { name: string; color: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || 'Failed to create label');
    }
    const data = await response.json();
    return data.label as Label;
  }
);

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async (payload: { id: string; name: string; color: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/labels', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || 'Failed to update label');
    }
    const data = await response.json();
    return data.label as Label;
  }
);

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { token: string | null } };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const response = await fetch('/api/labels', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to delete label');
    }
    return id;
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
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        const index = state.items.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
      });
  },
});

export default labelsSlice.reducer;
