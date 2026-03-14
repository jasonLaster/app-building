import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { toggleSidebar } from '../slices/uiSlice';
import './SidebarCollapse.css';

export default function SidebarCollapse() {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  return (
    <button
      className="sidebar-collapse-toggle"
      onClick={() => dispatch(toggleSidebar())}
      data-testid="sidebar-collapse-toggle"
      title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        className={`sidebar-collapse-icon ${sidebarCollapsed ? 'sidebar-collapse-icon-collapsed' : ''}`}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
    </button>
  );
}
