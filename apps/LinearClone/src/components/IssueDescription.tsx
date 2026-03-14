import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { updateIssueField } from '../slices/issueDetailSlice';
import './IssueDescription.css';

interface IssueDescriptionProps {
  issueId: string;
  description: string;
}

function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (```)
  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    return `<pre class="md-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> (not already in <ul>) in <ol>
  html = html.replace(/(?<!<\/ul>)(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('<ul>')) return match;
    return `<ol>${match}</ol>`;
  });

  // Paragraphs (lines that aren't already block elements)
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('</ul') ||
      trimmed.startsWith('</ol')
    ) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

export default function IssueDescription({ issueId, description }: IssueDescriptionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(description);
  }, [description]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  function handleClick() {
    setEditing(true);
  }

  async function handleBlur() {
    if (value !== description) {
      await dispatch(updateIssueField({ issueId, field: 'description', value }));
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setValue(description);
      setEditing(false);
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }

  return (
    <div className="issue-description" data-testid="issue-description">
      {editing ? (
        <textarea
          ref={textareaRef}
          className="issue-description-editor"
          value={value}
          onChange={handleTextareaChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Add a description..."
          data-testid="issue-description-editor"
        />
      ) : (
        <div
          className={`issue-description-content ${!description ? 'issue-description-placeholder' : ''}`}
          onClick={handleClick}
          data-testid="issue-description-content"
        >
          {description ? (
            <div
              className="issue-description-rendered"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
              data-testid="issue-description-rendered"
            />
          ) : (
            <span data-testid="issue-description-empty">Add a description...</span>
          )}
        </div>
      )}
    </div>
  );
}
