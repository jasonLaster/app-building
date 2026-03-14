import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchWorkspace } from '../slices/workspaceSlice';
import WorkspaceSettings from '../components/WorkspaceSettings';
import './Settings.css';

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.workspace);

  useEffect(() => {
    if (token) {
      dispatch(fetchWorkspace());
    }
  }, [dispatch, token]);

  return (
    <div className="settings-page" data-testid="settings-page">
      <div className="settings-header">
        <h1 className="settings-title" data-testid="settings-title">Settings</h1>
      </div>

      {loading ? (
        <div className="settings-loading" data-testid="settings-loading">
          Loading...
        </div>
      ) : (
        <WorkspaceSettings />
      )}
    </div>
  );
}
