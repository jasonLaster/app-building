import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CreateIssueModalPayload {
  parentId?: string;
  teamId?: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  createIssueModalOpen: boolean;
  createIssueDefaultParentId: string | null;
  createIssueDefaultTeamId: string | null;
}

const initialState: UiState = {
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  createIssueModalOpen: false,
  createIssueDefaultParentId: null,
  createIssueDefaultTeamId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(state.sidebarCollapsed));
    },
    openCreateIssueModal: {
      reducer(state, action: PayloadAction<CreateIssueModalPayload>) {
        state.createIssueModalOpen = true;
        state.createIssueDefaultParentId = action.payload.parentId || null;
        state.createIssueDefaultTeamId = action.payload.teamId || null;
      },
      prepare(payload?: CreateIssueModalPayload) {
        return { payload: payload || {} };
      },
    },
    closeCreateIssueModal(state) {
      state.createIssueModalOpen = false;
      state.createIssueDefaultParentId = null;
      state.createIssueDefaultTeamId = null;
    },
  },
});

export const { toggleSidebar, openCreateIssueModal, closeCreateIssueModal } = uiSlice.actions;
export default uiSlice.reducer;
