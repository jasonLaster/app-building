import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import teamsReducer from './slices/teamsSlice';
import workspaceReducer from './slices/workspaceSlice';
import notificationsReducer from './slices/notificationsSlice';
import issuesReducer from './slices/issuesSlice';
import labelsReducer from './slices/labelsSlice';
import teamIssuesReducer from './slices/teamIssuesSlice';
import issueDetailReducer from './slices/issueDetailSlice';
import cyclesReducer from './slices/cyclesSlice';
import projectsReducer from './slices/projectsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    teams: teamsReducer,
    workspace: workspaceReducer,
    notifications: notificationsReducer,
    issues: issuesReducer,
    labels: labelsReducer,
    teamIssues: teamIssuesReducer,
    issueDetail: issueDetailReducer,
    cycles: cyclesReducer,
    projects: projectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
