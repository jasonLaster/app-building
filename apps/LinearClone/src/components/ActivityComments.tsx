import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { ActivityEntry, Comment } from '../slices/issueDetailSlice';
import { addComment } from '../slices/issueDetailSlice';
import './ActivityComments.css';

interface ActivityCommentsProps {
  issueId: string;
  activity: ActivityEntry[];
  comments: Comment[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ActivityComments({ issueId, activity, comments }: ActivityCommentsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'activity' | 'comments'>('activity');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitComment() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    await dispatch(addComment({ issueId, content: commentText.trim() }));
    setCommentText('');
    setSubmitting(false);
  }

  function handleCommentKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  }

  return (
    <div className="activity-comments" data-testid="activity-comments">
      <div className="activity-comments-tabs" data-testid="activity-comments-tabs">
        <button
          className={`activity-comments-tab ${activeTab === 'activity' ? 'activity-comments-tab-active' : ''}`}
          onClick={() => setActiveTab('activity')}
          data-testid="activity-tab"
        >
          Activity
        </button>
        <button
          className={`activity-comments-tab ${activeTab === 'comments' ? 'activity-comments-tab-active' : ''}`}
          onClick={() => setActiveTab('comments')}
          data-testid="comments-tab"
        >
          Comments
        </button>
      </div>

      <div className="activity-comments-content" data-testid="activity-comments-content">
        {activeTab === 'activity' ? (
          <div className="activity-list" data-testid="activity-list">
            {activity.length === 0 ? (
              <div className="activity-empty" data-testid="activity-empty">No activity yet</div>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} className="activity-entry" data-testid={`activity-entry-${entry.id}`}>
                  <div className="activity-avatar">
                    {entry.memberName ? getInitials(entry.memberName) : '?'}
                  </div>
                  <div className="activity-info">
                    <span className="activity-actor">{entry.memberName || 'Unknown'}</span>
                    <span className="activity-action">{entry.action}</span>
                    <span className="activity-time">{formatRelativeTime(entry.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="comments-list" data-testid="comments-list">
            {comments.length === 0 ? (
              <div className="comments-empty" data-testid="comments-empty">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-entry" data-testid={`comment-entry-${comment.id}`}>
                  <div className="comment-avatar">
                    {comment.memberName ? getInitials(comment.memberName) : '?'}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{comment.memberName || 'Unknown'}</span>
                      <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-content" data-testid={`comment-content-${comment.id}`}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="activity-comments-input" data-testid="comment-input-section">
        <textarea
          className="comment-textarea"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleCommentKeyDown}
          rows={2}
          data-testid="comment-input"
        />
        <button
          className="comment-submit-btn"
          onClick={handleSubmitComment}
          disabled={!commentText.trim() || submitting}
          data-testid="comment-submit-btn"
        >
          Comment
        </button>
      </div>
    </div>
  );
}
