import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { addTodo } from '../slices/todosSlice';
import type { AppDispatch } from '../store';
import './Header.css';

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(addTodo(trimmed));
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="header" data-testid="header">
      <h1 className="header-title" data-testid="header-title">Todo App</h1>
      <div className="header-input-row">
        <input
          className="header-input"
          data-testid="todo-input"
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="header-add-btn"
          data-testid="add-todo-button"
          onClick={handleSubmit}
          aria-label="Add todo"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
