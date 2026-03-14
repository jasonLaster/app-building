import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { Notification } from '../slices/notificationsSlice';
import { markNotificationRead, archiveNotification } from '../slices/notificationsSlice';
import './NotificationRow.css';

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function AssignmentIcon() {
  return (
    <svg className="notification-type-icon notification-type-icon-assignment" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function UpdateIcon() {
  return (
    <svg className="notification-type-icon notification-type-icon-update" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function MentionIcon() {
  return (
    <svg className="notification-type-icon notification-type-icon-mention" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'assignment':
      return <AssignmentIcon />;
    case 'update':
      return <UpdateIcon />;
    case 'mention':
      return <MentionIcon />;
    default:
      return <UpdateIcon />;
  }
}

interface NotificationRowProps {
  notification: Notification;
}

export default function NotificationRow({ notification }: NotificationRowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  function handleClick() {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }
    navigate(`/issue/${notification.issue_id}`);
  }

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch(archiveNotification(notification.id));
  }

  return (
    <div
      className={`notification-row ${!notification.read ? 'notification-row-unread' : ''}`}
      data-testid={`notification-row-${notification.id}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      <div className="notification-row-left">
        <span className="notification-row-icon" data-testid={`notification-icon-${notification.id}`}>
          {getTypeIcon(notification.type)}
        </span>
        <span className="notification-row-identifier" data-testid={`notification-identifier-${notification.id}`}>
          {notification.issue_identifier}
        </span>
        <span className="notification-row-description" data-testid={`notification-description-${notification.id}`}>
          {notification.description}
        </span>
      </div>
      <div className="notification-row-right">
        <span className="notification-row-timestamp" data-testid={`notification-timestamp-${notification.id}`}>
          {formatRelativeTime(notification.created_at)}
        </span>
        <button
          className="notification-row-archive-btn"
          onClick={handleArchive}
          title="Archive"
          data-testid={`notification-archive-btn-${notification.id}`}
        >
          <ArchiveIcon />
        </button>
      </div>
    </div>
  );
}
