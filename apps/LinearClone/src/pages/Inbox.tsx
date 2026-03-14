import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchNotifications } from '../slices/notificationsSlice';
import NotificationList from '../components/NotificationList';
import './Inbox.css';

export default function Inbox() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: notifications, loading, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, token]);

  return (
    <div className="inbox-page" data-testid="inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title" data-testid="inbox-title">
          Inbox
          {unreadCount > 0 && (
            <span className="inbox-title-count" data-testid="inbox-title-count">
              ({unreadCount})
            </span>
          )}
        </h1>
      </div>
      <NotificationList
        notifications={notifications}
        loading={loading}
        unreadCount={unreadCount}
      />
    </div>
  );
}
