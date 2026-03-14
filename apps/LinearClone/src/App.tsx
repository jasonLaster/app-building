import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchCurrentUser } from './slices/authSlice';
import { fetchTeams } from './slices/teamsSlice';
import { Sidebar } from './components/Sidebar';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { CreateIssueModal } from './components/CreateIssueModal';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MyIssues from './pages/MyIssues';
import Inbox from './pages/Inbox';
import TeamIssues from './pages/TeamIssues';
import IssueDetail from './pages/IssueDetail';
import ActiveCycle from './pages/ActiveCycle';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Members from './pages/Members';
import Teams from './pages/Teams';
import Labels from './pages/Labels';
import Settings from './pages/Settings';

function AuthenticatedLayout() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  return (
    <div className="app-layout" data-testid="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/my-issues" element={<MyIssues />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/team/:teamId/issues" element={<TeamIssues />} />
          <Route path="/team/:teamId/cycles" element={<ActiveCycle />} />
          <Route path="/issue/:issueId" element={<IssueDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/settings/members" element={<Members />} />
          <Route path="/settings/teams" element={<Teams />} />
          <Route path="/settings/labels" element={<Labels />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/my-issues" replace />} />
        </Routes>
      </main>
      <KeyboardShortcuts />
      <CreateIssueModal />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (!token && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (token && !user) {
    return (
      <div className="app-loading" data-testid="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (token && user && isAuthPage) {
    return <Navigate to="/my-issues" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/*" element={<AuthenticatedLayout />} />
    </Routes>
  );
}
