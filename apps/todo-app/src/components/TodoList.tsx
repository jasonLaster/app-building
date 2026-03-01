import { useDispatch } from 'react-redux';
import { Check, Trash2 } from 'lucide-react';
import { toggleTodo, deleteTodo } from '../slices/todosSlice';
import type { Todo } from '../slices/todosSlice';
import type { AppDispatch } from '../store';
import './TodoList.css';

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  const dispatch = useDispatch<AppDispatch>();

  if (todos.length === 0) {
    return (
      <div className="todo-list-empty" data-testid="empty-state">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <div className="todo-list" data-testid="todo-list">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}
          data-testid="todo-item"
        >
          <button
            className={`todo-checkbox ${todo.completed ? 'todo-checkbox--checked' : ''}`}
            data-testid="todo-checkbox"
            onClick={() => dispatch(toggleTodo({ id: todo.id, completed: !todo.completed }))}
            aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
          >
            {todo.completed && <Check size={14} />}
          </button>
          <span
            className={`todo-text ${todo.completed ? 'todo-text--completed' : ''}`}
            data-testid="todo-text"
          >
            {todo.text}
          </span>
          <button
            className="todo-delete"
            data-testid="delete-todo-button"
            onClick={() => dispatch(deleteTodo(todo.id))}
            aria-label="Delete todo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
