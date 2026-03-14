import { useState } from 'react';
import type { Label } from '../slices/labelsSlice';
import './EditDeleteLabel.css';

const PRESET_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Gray', hex: '#6b7280' },
];

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

interface EditDeleteLabelProps {
  label: Label;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onSave: (id: string, name: string, color: string) => Promise<void>;
  onDeleteClick: () => void;
  existingNames: string[];
}

export default function EditDeleteLabel({
  label,
  isEditing,
  onEditStart,
  onEditCancel,
  onSave,
  onDeleteClick,
  existingNames,
}: EditDeleteLabelProps) {
  const [editName, setEditName] = useState(label.name);
  const [editColor, setEditColor] = useState(label.color);
  const [customHex, setCustomHex] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleEditStart() {
    setEditName(label.name);
    setEditColor(label.color);
    setCustomHex('');
    setNameError(null);
    setColorError(null);
    setSaving(false);
    onEditStart();
  }

  function handlePresetClick(hex: string) {
    setEditColor(hex);
    setCustomHex('');
    setColorError(null);
  }

  function handleCustomHexChange(value: string) {
    setCustomHex(value);
    setColorError(null);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (isValidHex(normalized)) {
      setEditColor(normalized);
    }
  }

  async function handleSave() {
    let hasError = false;
    setNameError(null);
    setColorError(null);

    if (!editName.trim()) {
      setNameError('Label name is required');
      hasError = true;
    } else if (existingNames.includes(editName.trim().toLowerCase())) {
      setNameError('A label with this name already exists');
      hasError = true;
    }

    if (customHex) {
      const normalized = customHex.startsWith('#') ? customHex : `#${customHex}`;
      if (!isValidHex(normalized)) {
        setColorError('Invalid color format');
        hasError = true;
      }
    }

    if (hasError) return;

    setSaving(true);
    try {
      const finalColor = customHex
        ? (customHex.startsWith('#') ? customHex : `#${customHex}`)
        : editColor;
      await onSave(label.id, editName.trim(), finalColor);
    } catch (err) {
      if (err instanceof Error) {
        setNameError(err.message);
      } else {
        setNameError('Failed to update label');
      }
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  }

  function handleDelete() {
    onEditCancel();
    onDeleteClick();
  }

  const activeColor = customHex
    ? (isValidHex(customHex.startsWith('#') ? customHex : `#${customHex}`) ? (customHex.startsWith('#') ? customHex : `#${customHex}`) : editColor)
    : editColor;

  if (isEditing) {
    return (
      <div
        className="label-row label-row-editing"
        data-testid={`label-row-${label.id}`}
        onKeyDown={handleKeyDown}
      >
        <div className="label-row-edit-content">
          <div className="label-row-edit-name-row">
            <span
              className="label-dot"
              style={{ backgroundColor: activeColor }}
              data-testid={`label-dot-${label.id}`}
            />
            <input
              type="text"
              className={`label-edit-input ${nameError ? 'label-edit-input-error' : ''}`}
              value={editName}
              onChange={(e) => { setEditName(e.target.value); setNameError(null); }}
              data-testid={`label-edit-name-input-${label.id}`}
              autoFocus
            />
          </div>
          {nameError && (
            <span className="label-edit-error" data-testid={`label-edit-name-error-${label.id}`}>{nameError}</span>
          )}
          <div className="label-edit-color-section">
            <div className="label-edit-presets">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  className={`label-edit-swatch ${editColor === preset.hex && !customHex ? 'label-edit-swatch-selected' : ''}`}
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => handlePresetClick(preset.hex)}
                  title={preset.name}
                  data-testid={`label-edit-swatch-${preset.name.toLowerCase()}-${label.id}`}
                  type="button"
                />
              ))}
            </div>
            <input
              type="text"
              className={`label-edit-hex-input ${colorError ? 'label-edit-input-error' : ''}`}
              placeholder="#hex"
              value={customHex}
              onChange={(e) => handleCustomHexChange(e.target.value)}
              data-testid={`label-edit-hex-input-${label.id}`}
            />
            {colorError && (
              <span className="label-edit-error" data-testid={`label-edit-color-error-${label.id}`}>{colorError}</span>
            )}
          </div>
        </div>
        <div className="label-row-edit-actions">
          <button
            className="label-edit-cancel-btn"
            onClick={onEditCancel}
            data-testid={`label-edit-cancel-btn-${label.id}`}
            type="button"
          >
            Cancel
          </button>
          <button
            className="label-edit-save-btn"
            onClick={handleSave}
            disabled={saving}
            data-testid={`label-edit-save-btn-${label.id}`}
            type="button"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="label-row"
      data-testid={`label-row-${label.id}`}
    >
      <div className="label-row-name">
        <span
          className="label-dot"
          style={{ backgroundColor: label.color }}
          data-testid={`label-dot-${label.id}`}
        />
        <span className="label-name" data-testid={`label-name-${label.id}`}>
          {label.name}
        </span>
      </div>
      <div className="label-row-count" data-testid={`label-count-${label.id}`}>
        {label.issue_count}
      </div>
      <div className="label-row-actions">
        <button
          className="label-action-btn"
          onClick={handleEditStart}
          title="Edit label"
          data-testid={`label-edit-btn-${label.id}`}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="label-action-btn label-action-btn-delete"
          onClick={handleDelete}
          title="Delete label"
          data-testid={`label-delete-btn-${label.id}`}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
