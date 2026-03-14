import type { Notification } from '../slices/notificationsSlice';
import NotificationRow from './NotificationRow';
import './NotificationList.css';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
}

export default function NotificationList({ notifications, loading, unreadCount }: NotificationListProps) {
  if (loading) {
    return (
      <div className="notification-list-loading" data-testid="notification-list-loading">
        Loading...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notification-list-empty" data-testid="notification-list-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        <p>You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="notification-list" data-testid="notification-list">
      <div className="notification-list-header" data-testid="notification-list-header">
        <span className="notification-list-title">
          Inbox
          {unreadCount > 0 && (
            <span className="notification-list-count" data-testid="notification-list-count">
              ({unreadCount})
            </span>
          )}
        </span>
      </div>
      <div className="notification-list-items" data-testid="notification-list-items">
        {notifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
