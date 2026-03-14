import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  createIssueModalOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  createIssueModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(state.sidebarCollapsed));
    },
    openCreateIssueModal(state) {
      state.createIssueModalOpen = true;
    },
    closeCreateIssueModal(state) {
      state.createIssueModalOpen = false;
    },
  },
});

export const { toggleSidebar, openCreateIssueModal, closeCreateIssueModal } = uiSlice.actions;
export default uiSlice.reducer;
