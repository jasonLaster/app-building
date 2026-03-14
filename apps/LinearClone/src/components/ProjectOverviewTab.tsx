import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  updateProjectField,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../slices/projectDetailSlice';
import './ProjectOverviewTab.css';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function simpleMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Headings
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);
  // Line breaks for remaining text
  html = html.replace(/\n/g, '<br>');
  // Clean up double brs inside ul
  html = html.replace(/<ul><br>/g, '<ul>');
  html = html.replace(/<br><\/ul>/g, '</ul>');
  return html;
}

export default function ProjectOverviewTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { project, milestones } = useSelector((state: RootState) => state.projectDetail);

  // Description editing
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(project?.description || '');
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Milestone add form
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // Milestone editing
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editMilestoneName, setEditMilestoneName] = useState('');
  const [editMilestoneDate, setEditMilestoneDate] = useState('');

  // Delete confirmation
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    setDescValue(project?.description || '');
  }, [project?.description]);

  useEffect(() => {
    if (editingDesc) {
      descRef.current?.focus();
    }
  }, [editingDesc]);

  if (!project) return null;

  // Description handlers
  function handleDescClick() {
    setEditingDesc(true);
  }

  async function saveDescription() {
    const val = descValue.trim() || null;
    if (val !== (project?.description || null)) {
      await dispatch(updateProjectField({ projectId: project!.id, field: 'description', value: val }));
    }
    setEditingDesc(false);
  }

  function handleDescKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setDescValue(project?.description || '');
      setEditingDesc(false);
    }
  }

  // Milestone handlers
  async function handleAddMilestone() {
    if (!newMilestoneName.trim()) return;
    await dispatch(createMilestone({
      projectId: project!.id,
      name: newMilestoneName.trim(),
      targetDate: newMilestoneDate || null,
    }));
    setNewMilestoneName('');
    setNewMilestoneDate('');
    setShowAddMilestone(false);
  }

  function handleCancelAddMilestone() {
    setNewMilestoneName('');
    setNewMilestoneDate('');
    setShowAddMilestone(false);
  }

  async function handleToggleMilestoneComplete(milestoneId: string, currentCompleted: boolean) {
    dispatch(updateMilestone({
      milestoneId,
      projectId: project!.id,
      completed: !currentCompleted,
    }));
  }

  function startEditMilestone(milestoneId: string, name: string, targetDate: string | null) {
    setEditingMilestoneId(milestoneId);
    setEditMilestoneName(name);
    setEditMilestoneDate(targetDate || '');
  }

  async function saveEditMilestone() {
    if (!editingMilestoneId || !editMilestoneName.trim()) return;
    await dispatch(updateMilestone({
      milestoneId: editingMilestoneId,
      projectId: project!.id,
      name: editMilestoneName.trim(),
      targetDate: editMilestoneDate || null,
    }));
    setEditingMilestoneId(null);
  }

  async function confirmDeleteMilestone() {
    if (!deletingMilestoneId) return;
    await dispatch(deleteMilestone({
      milestoneId: deletingMilestoneId,
      projectId: project!.id,
    }));
    setDeletingMilestoneId(null);
  }

  // Key metrics
  const totalIssues = project.totalIssues;
  const completedIssues = project.completedIssues;
  const inProgressIssues = project.inProgressIssues;
  const remainingIssues = totalIssues - completedIssues;
  const completionPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  return (
    <div className="project-overview-tab" data-testid="project-overview-tab">
      {/* Description */}
      <div className="project-overview-section" data-testid="project-overview-description-section">
        <h3 className="project-overview-section-title">Description</h3>
        {editingDesc ? (
          <div className="project-overview-desc-edit">
            <textarea
              ref={descRef}
              className="project-overview-desc-textarea"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={saveDescription}
              onKeyDown={handleDescKeyDown}
              placeholder="Add a description..."
              data-testid="project-overview-description-input"
            />
          </div>
        ) : (
          <div
            className={`project-overview-desc-display ${!project.description ? 'project-overview-desc-placeholder' : ''}`}
            onClick={handleDescClick}
            data-testid="project-overview-description"
          >
            {project.description ? (
              <div
                className="project-overview-desc-rendered"
                dangerouslySetInnerHTML={{ __html: simpleMarkdown(project.description) }}
              />
            ) : (
              <span>Add a description...</span>
            )}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="project-overview-section" data-testid="project-overview-milestones-section">
        <div className="project-overview-section-header">
          <h3 className="project-overview-section-title">Milestones</h3>
          <button
            className="project-overview-add-btn"
            onClick={() => setShowAddMilestone(true)}
            data-testid="project-overview-add-milestone-btn"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Milestone
          </button>
        </div>

        {/* Add milestone form */}
        {showAddMilestone && (
          <div className="project-overview-milestone-form" data-testid="project-overview-milestone-form">
            <input
              className="project-overview-milestone-name-input"
              placeholder="Milestone name"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              data-testid="project-overview-milestone-name-input"
            />
            <input
              type="date"
              className="project-overview-milestone-date-input"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              data-testid="project-overview-milestone-date-input"
            />
            <div className="project-overview-milestone-form-actions">
              <button
                className="project-overview-milestone-save-btn"
                onClick={handleAddMilestone}
                data-testid="project-overview-milestone-save-btn"
              >
                Save
              </button>
              <button
                className="project-overview-milestone-cancel-btn"
                onClick={handleCancelAddMilestone}
                data-testid="project-overview-milestone-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Milestone list */}
        {milestones.length === 0 && !showAddMilestone ? (
          <div className="project-overview-milestones-empty" data-testid="project-overview-milestones-empty">
            <p>No milestones yet. Add one to track progress.</p>
          </div>
        ) : (
          <div className="project-overview-milestones-list" data-testid="project-overview-milestones-list">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className={`project-overview-milestone ${ms.completed ? 'project-overview-milestone-completed' : ''}`}
                data-testid={`project-overview-milestone-${ms.id}`}
              >
                {editingMilestoneId === ms.id ? (
                  <div className="project-overview-milestone-edit-row">
                    <input
                      className="project-overview-milestone-name-input"
                      value={editMilestoneName}
                      onChange={(e) => setEditMilestoneName(e.target.value)}
                      data-testid={`project-overview-milestone-edit-name-${ms.id}`}
                    />
                    <input
                      type="date"
                      className="project-overview-milestone-date-input"
                      value={editMilestoneDate}
                      onChange={(e) => setEditMilestoneDate(e.target.value)}
                      data-testid={`project-overview-milestone-edit-date-${ms.id}`}
                    />
                    <button
                      className="project-overview-milestone-save-btn"
                      onClick={saveEditMilestone}
                      data-testid={`project-overview-milestone-edit-save-${ms.id}`}
                    >
                      Save
                    </button>
                    <button
                      className="project-overview-milestone-cancel-btn"
                      onClick={() => setEditingMilestoneId(null)}
                      data-testid={`project-overview-milestone-edit-cancel-${ms.id}`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="project-overview-milestone-check" data-testid={`project-overview-milestone-toggle-${ms.id}`}>
                      <input
                        type="checkbox"
                        checked={ms.completed}
                        onChange={() => handleToggleMilestoneComplete(ms.id, ms.completed)}
                      />
                    </label>
                    <div className="project-overview-milestone-info">
                      <span
                        className={`project-overview-milestone-name ${ms.completed ? 'project-overview-milestone-name-done' : ''}`}
                        onClick={() => startEditMilestone(ms.id, ms.name, ms.targetDate)}
                        data-testid={`project-overview-milestone-name-${ms.id}`}
                      >
                        {ms.name}
                      </span>
                      {ms.targetDate && (
                        <span
                          className="project-overview-milestone-date"
                          onClick={() => startEditMilestone(ms.id, ms.name, ms.targetDate)}
                          data-testid={`project-overview-milestone-date-${ms.id}`}
                        >
                          {formatDate(ms.targetDate)}
                        </span>
                      )}
                    </div>
                    <button
                      className="project-overview-milestone-delete-btn"
                      onClick={() => setDeletingMilestoneId(ms.id)}
                      data-testid={`project-overview-milestone-delete-btn-${ms.id}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        {deletingMilestoneId && (
          <div className="project-overview-delete-dialog-overlay" data-testid="project-overview-delete-dialog">
            <div className="project-overview-delete-dialog">
              <p>Are you sure you want to delete this milestone?</p>
              <div className="project-overview-delete-dialog-actions">
                <button
                  className="project-overview-delete-confirm-btn"
                  onClick={confirmDeleteMilestone}
                  data-testid="project-overview-delete-confirm-btn"
                >
                  Delete
                </button>
                <button
                  className="project-overview-delete-cancel-btn"
                  onClick={() => setDeletingMilestoneId(null)}
                  data-testid="project-overview-delete-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="project-overview-section" data-testid="project-overview-metrics-section">
        <h3 className="project-overview-section-title">Key Metrics</h3>
        <div className="project-overview-metrics" data-testid="project-overview-metrics">
          <div className="project-overview-metric" data-testid="project-overview-metric-total">
            <span className="project-overview-metric-value">{totalIssues}</span>
            <span className="project-overview-metric-label">Total Issues</span>
          </div>
          <div className="project-overview-metric" data-testid="project-overview-metric-completed">
            <span className="project-overview-metric-value project-overview-metric-green">{completedIssues}</span>
            <span className="project-overview-metric-label">Completed</span>
          </div>
          <div className="project-overview-metric" data-testid="project-overview-metric-in-progress">
            <span className="project-overview-metric-value project-overview-metric-accent">{inProgressIssues}</span>
            <span className="project-overview-metric-label">In Progress</span>
          </div>
          <div className="project-overview-metric" data-testid="project-overview-metric-remaining">
            <span className="project-overview-metric-value">{remainingIssues}</span>
            <span className="project-overview-metric-label">Remaining</span>
          </div>
          <div className="project-overview-metric" data-testid="project-overview-metric-percentage">
            <span className="project-overview-metric-value project-overview-metric-green">{completionPercentage}%</span>
            <span className="project-overview-metric-label">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
