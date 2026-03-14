import { useState, useRef, useEffect } from 'react';
import './CreateLabel.css';

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

interface CreateLabelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => Promise<void>;
  existingNames: string[];
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export default function CreateLabel({ open, onClose, onSubmit, existingNames }: CreateLabelProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]!.hex);
  const [customHex, setCustomHex] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setColor(PRESET_COLORS[0]!.hex);
      setCustomHex('');
      setNameError(null);
      setColorError(null);
      setSubmitting(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  function handlePresetClick(hex: string) {
    setColor(hex);
    setCustomHex('');
    setColorError(null);
  }

  function handleCustomHexChange(value: string) {
    setCustomHex(value);
    setColorError(null);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (isValidHex(normalized)) {
      setColor(normalized);
    }
  }

  async function handleSubmit() {
    let hasError = false;
    setNameError(null);
    setColorError(null);

    if (!name.trim()) {
      setNameError('Label name is required');
      hasError = true;
    } else if (existingNames.includes(name.trim().toLowerCase())) {
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

    setSubmitting(true);
    try {
      const finalColor = customHex
        ? (customHex.startsWith('#') ? customHex : `#${customHex}`)
        : color;
      await onSubmit(name.trim(), finalColor);
    } catch (err) {
      if (err instanceof Error) {
        setNameError(err.message);
      } else {
        setNameError('Failed to create label');
      }
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (!open) return null;

  const activeColor = customHex
    ? (isValidHex(customHex.startsWith('#') ? customHex : `#${customHex}`) ? (customHex.startsWith('#') ? customHex : `#${customHex}`) : color)
    : color;

  return (
    <div className="create-label" data-testid="create-label-form" onKeyDown={handleKeyDown}>
      <div className="create-label-body">
        <div className="create-label-field">
          <label className="create-label-field-label">Name</label>
          <div className="create-label-name-row">
            <span
              className="create-label-preview-dot"
              style={{ backgroundColor: activeColor }}
              data-testid="create-label-color-preview"
            />
            <input
              ref={nameRef}
              type="text"
              className={`create-label-input ${nameError ? 'create-label-input-error' : ''}`}
              placeholder="Label name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null); }}
              data-testid="create-label-name-input"
            />
          </div>
          {nameError && (
            <span className="create-label-error" data-testid="create-label-name-error">{nameError}</span>
          )}
        </div>

        <div className="create-label-field">
          <label className="create-label-field-label">Color</label>
          <div className="create-label-color-picker" data-testid="create-label-color-picker">
            <div className="create-label-presets">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  className={`create-label-swatch ${color === preset.hex && !customHex ? 'create-label-swatch-selected' : ''}`}
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => handlePresetClick(preset.hex)}
                  title={preset.name}
                  data-testid={`create-label-swatch-${preset.name.toLowerCase()}`}
                  type="button"
                />
              ))}
            </div>
            <div className="create-label-custom-hex">
              <input
                type="text"
                className={`create-label-hex-input ${colorError ? 'create-label-input-error' : ''}`}
                placeholder="#hex"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                data-testid="create-label-hex-input"
              />
            </div>
          </div>
          {colorError && (
            <span className="create-label-error" data-testid="create-label-color-error">{colorError}</span>
          )}
        </div>
      </div>

      <div className="create-label-actions">
        <button
          className="create-label-cancel-btn"
          onClick={onClose}
          data-testid="create-label-cancel-btn"
          type="button"
        >
          Cancel
        </button>
        <button
          className="create-label-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          data-testid="create-label-submit-btn"
          type="button"
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  );
}
