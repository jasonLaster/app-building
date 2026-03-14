import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import type { Issue } from '../slices/issuesSlice';
import { updateIssueField } from '../slices/issueDetailSlice';
import { StatusIcon, STATUS_CONFIG, STATUS_ORDER } from './IssueRow';
import './IssueHeader.css';

interface IssueHeaderProps {
  issue: Issue;
}

export default function IssueHeader({ issue }: IssueHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(issue.title);
  const [titleError, setTitleError] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleValue(issue.title);
  }, [issue.title]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownOpen]);

  function handleTitleClick() {
    setEditingTitle(true);
    setTitleError(false);
  }

  async function saveTitle() {
    const trimmed = titleValue.trim();
    if (!trimmed) {
      setTitleError(true);
      return;
    }
    if (trimmed !== issue.title) {
      await dispatch(updateIssueField({ issueId: issue.id, field: 'title', value: trimmed }));
    }
    setEditingTitle(false);
    setTitleError(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitleValue(issue.title);
      setEditingTitle(false);
      setTitleError(false);
    }
  }

  function handleStatusChange(newStatus: string) {
    dispatch(updateIssueField({ issueId: issue.id, field: 'status', value: newStatus }));
    setStatusDropdownOpen(false);
  }

  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.todo;

  return (
    <div className="issue-header" data-testid="issue-header">
      <div className="issue-header-identifier" data-testid="issue-header-identifier">
        {issue.identifier}
      </div>

      <div className="issue-header-title-row">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className={`issue-header-title-input ${titleError ? 'issue-header-title-input-error' : ''}`}
            value={titleValue}
            onChange={(e) => { setTitleValue(e.target.value); setTitleError(false); }}
            onBlur={saveTitle}
            onKeyDown={handleTitleKeyDown}
            data-testid="issue-header-title-input"
          />
        ) : (
          <h1
            className="issue-header-title"
            onClick={handleTitleClick}
            data-testid="issue-header-title"
          >
            {issue.title}
          </h1>
        )}
      </div>

      <div className="issue-header-status-row" ref={statusRef}>
        <button
          className="issue-header-status-btn"
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          data-testid="issue-header-status-btn"
        >
          <StatusIcon status={issue.status} color={statusConfig.color} />
          <span style={{ color: statusConfig.color }}>{statusConfig.label}</span>
        </button>
        {statusDropdownOpen && (
          <div className="issue-header-status-dropdown" data-testid="issue-header-status-dropdown">
            {STATUS_ORDER.map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  className={`issue-header-status-option ${issue.status === s ? 'issue-header-status-option-active' : ''}`}
                  onClick={() => handleStatusChange(s)}
                  data-testid={`issue-header-status-option-${s}`}
                >
                  <StatusIcon status={s} color={cfg.color} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
